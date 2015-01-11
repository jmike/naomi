var util = require('util');
var pg = require('pg.js');
var createPool = require('generic-pool').Pool;
var Promise = require('bluebird');
var Joi = require('joi');
var GenericDatabase = require('../Database');
var Table = require('./Table');
var Transaction = require('./Transaction');

/**
 * Constructs a new Postgres Database.
 * @param {object} props connection properties.
 * @param {string} props.database the name of the database.
 * @param {string} [props.host=localhost] the hostname of the database.
 * @param {(string|number)} [props.port] the port number of the database.
 * @param {string} [props.user=root] the user to access the database.
 * @param {string} [props.password] the password of the user.
 * @param {number} [props.connectionLimit=10] number maximum number of connections to maintain in the pool.
 * @extends {GenericDatabase}
 * @throws {Error} if props is unspecified or invalid.
 * @constructor
 */
function Database(props) {
  var schema;
  var validationResult;

  // set connection properties schema
  schema = Joi.object()
    .label('connection properties')
    .keys({
      host: Joi.string().label('host').hostname().strict().optional().default('localhost'),
      port: Joi.number().label('port').min(0).max(65536).optional().default(5432),
      user: Joi.string().label('user').strict().optional().default('root'),
      password: Joi.string().label('password').strict().optional().default('').allow(''),
      database: Joi.string().label('database name').strict().required(),
      connectionLimit: Joi.number().label('connection limit').min(1).max(1000).strict().optional().default(10),
      poolIdleTimeout: Joi.number().min(1000).strict().optional().default(30000),
      reapIntervalMillis: Joi.number().min(1000).strict().optional().default(1000)
    });

  // validate connection properties
  validationResult = Joi.validate(props, schema);

  if (validationResult.error) throw validationResult.error;
  props = validationResult.value;

  // init GenericDatabase
  GenericDatabase.call(this, props);
  this._pool = null;
}

// @extends GenericDatabase
util.inherits(Database, GenericDatabase);

/**
 * Attempts to connect to server using the connection properties supplied at construction time.
 * @param {function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 * @emits Database#connect
 */
Database.prototype.connect = function (callback) {
  var _this = this;

  // check if database is already connected
  if (this.isConnected) Promise.resolve().nodeify(callback);

  // connect
  return Promise.try(function () {
    _this._pool = createPool({
      create: function(callback) {
        var client = new pg.Client(_this.connectionProperties);

        client.connect(function (err) {
          if (err) return callback(err);
          callback(null, client);
        });
      },
      destroy: function(client) {
        client.end();
      },
      min: 1,
      max: _this.connectionProperties.poolSize,
      idleTimeoutMillis: _this.connectionProperties.poolIdleTimeout,
      reapIntervalMillis: _this.connectionProperties.reapIntervalMillis
    });
  })
    .then(function () {
      return GenericDatabase.prototype.connect.call(_this, callback);
    });
};

/**
 * Gracefully closes any open connection to the server.
 * Please note: the database will become practically useless after calling this method.
 * @param {function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 * @emits Database#disconnect
 */
Database.prototype.disconnect = function (callback) {
  var _this = this;

  // check if database is already disconnected
  if (!this.isConnected) return Promise.resolve().nodeify(callback);

  // disconnect
  return Promise.try(function () {
    _this._pool.drain(function () {
      _this._pool.destroyAllNow();
    });
  })
    .then(function () {
      return GenericDatabase.prototype.disconnect.call(_this, callback);
    });
};

/**
 * Acquires the first available client from pool.
 * @param {function} [callback] an optional callback function.
 * @return {Promise} resolving to client.
 */
Database.prototype.acquireClient = function (callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve, reject) {
    _this._pool.acquire(function(err, client) {
      if (err) return reject(err);
      resolve(client);
    });
  };

  return new Promise(resolver).nodeify(callback);
};

/**
 * Releases the designated client to pool.
 */
Database.prototype.releaseClient = function (client) {
  this._pool.release(client);
};

/**
 * Runs the given parameterized SQL statement to the supplied db client.
 * @param {Client} client a db client.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @returns {Promise} resolving to the query results.
 * @private
 * @static
 */
function queryClient(client, sql, params) {
  var resolver;

  resolver = function (resolve, reject) {
    client.query(sql, params, function(err, result) {
      if (err) return reject(err);
      resolve(result.rows);
    });
  };

  return new Promise(resolver);
}

/**
 * Converts ? chars to $1, $2, etc, according to the order they appear in the given SQL statement.
 * This method provides a compatibility layer with MySQL engine, exposing a uniform syntax for params.
 * @param {string} sql a parameterized SQL statement, using "?" to denote param.
 * @return {string}
 */
Database.prototype.prepareSQL = function (sql) {
  var re = /\?/g;
  var i = 0;

  return sql.replace(re, function () {
    i++;
    return '$' + i;
  });
};

/**
 * Executes the given parameterized SQL statement.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} [options] query options.
 * @param {function} [callback] a callback function, i.e. function(err, records).
 * @returns {Promise} resolving to the query results.
 */
Database.prototype.query = function (sql, params, options, callback) {
  var _this = this;
  var args;
  var resolver;

  // normalize arguments
  args = this._normalizeQueryArgs(sql, params, options, callback);
  sql = args[0];
  params = args[1];
  options = args[2];
  callback = args[3];

  resolver = function (resolve, reject) {
    // acquire client
    return _this.acquireClient()
      .then(function (client) {
        // replace "?" with "$#"
        sql = _this.prepareSQL(sql);
        // execute query
        return queryClient(client, sql, params)
          .finally(function () {
            // always release acquired client
            return _this.releaseClient(client);
          });
      })
      .then(resolve, reject);
  };

  return this._enqueue(resolver).nodeify(callback);
};

/**
 * Indicates whether the designated table exists in database.
 * @param {string} table the name of the table.
 * @param {function} [callback] a callback function with (err, bool) arguments.
 * @returns {Promise}
 */
Database.prototype.hasTable = function (table, callback) {
  var sql;
  var params;

  sql = [
    'SELECT table_name',
    'FROM information_schema.tables',
    'WHERE table_catalog = $1',
    'AND table_schema NOT IN (\'pg_catalog\', \'information_schema\')',
    'AND table_name = $2',
    'AND table_type = \'BASE TABLE\'',
    'LIMIT 1;'
  ].join(' ');
  params = [this.name, table];

  return this.query(sql, params)
    .then(function (records) {
      return records.length === 1;
    })
    .nodeify(callback);
};

/**
 * Retrieves table names from database.
 * @param {function} [callback] a callback function with (err, tables) arguments.
 * @returns {Promise}
 */
Database.prototype.getTables = function (callback) {
  var sql;
  var params;

  sql = [
    'SELECT table_name',
    'FROM information_schema.tables',
    'WHERE table_type = \'BASE TABLE\'',
    'AND table_catalog = $1',
    'AND table_schema NOT IN (\'pg_catalog\', \'information_schema\');'
  ].join(' ');
  params = [this.name];

  return this.query(sql, params)
    .map(function (record) {
      return record.table_name;
    })
    .nodeify(callback);
};

// associate with Postgres Table class
Database.prototype.Table = Table;

// associate with Postgres Transaction class
Database.prototype.Transaction = Transaction;

module.exports = Database;
