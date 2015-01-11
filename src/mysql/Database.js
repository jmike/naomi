var util = require('util');
var mysql = require('mysql');
var _ = require('lodash');
var Joi = require('joi');
var Promise = require('bluebird');
var GenericDatabase = require('../Database');
var Table = require('./Table');
var Transaction = require('./Transaction');

/**
 * Constructs a new MySQL Database of the designated properties.
 * @param {object} props connection properties.
 * @param {string} props.database the name of the database.
 * @param {string} [props.host=localhost] the hostname of the database.
 * @param {(number|string)} [props.port=3306] the port number of the database.
 * @param {string} [props.user=root] the user to access the database.
 * @param {string} [props.password] the password of the user.
 * @param {number} [props.connectionLimit=10] number maximum number of connections to maintain in the pool.
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
      port: Joi.number().label('port').min(0).max(65536).optional().default(3306),
      user: Joi.string().label('user').strict().optional().default('root'),
      password: Joi.string().label('password').strict().optional().default('').allow(''),
      database: Joi.string().label('database name').strict().required(),
      connectionLimit: Joi.number().label('connection limit').min(1).max(1000).strict().optional().default(10),
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

  // check if already connected
  if (this.isConnected) Promise.resolve().nodeify(callback);

  // connect
  return Promise.try(function () {
    _this._pool = mysql.createPool(_this.connectionProperties);
  })
    .then(function () {
      return GenericDatabase.prototype.connect.call(_this, callback);
    });
};

/**
 * Gracefully closes any open connection to the server.
 * Please note: this instance will become practically useless after calling this method.
 * @param {function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 * @emits Database#disconnect
 */
Database.prototype.disconnect = function (callback) {
  var _this = this;
  var resolver;

  // check if already disconnected
  if (!this.isConnected) return Promise.resolve().nodeify(callback);

  // disconnect
  resolver = function (resolve, reject) {
    _this._pool.end(function (err) {
      if (err) return reject(err);
      resolve();
    });
  };

  return new Promise(resolver)
    .then(function () {
      return GenericDatabase.prototype.disconnect.call(_this, callback);
    });
};

/**
 * Acquires the first available client from pool.
 * @param {function} [callback] an optional callback function with (err, client) arguments.
 * @return {Promise} resolving to client.
 */
Database.prototype.acquireClient = function (callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve, reject) {
    _this._pool.getConnection(function (err, client) {
      if (err) return reject(err);
      resolve(client);
    });
  };

  return new Promise(resolver).nodeify(callback);
};

/**
 * Releases the designated client to pool.
 * @param {Client} client
 */
Database.prototype.releaseClient = function (client) {
  client.release();
};

/**
 * Runs the given parameterized SQL statement to the supplied db client.
 * @param {Client} client a db client.
 * @param {(string|object)} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @returns {Promise} resolving to the query results.
 * @private
 * @static
 */
function queryClient(client, sql, params) {
  var resolver;

  resolver = function (resolve, reject) {
    client.query(sql, params, function (err, records) {
      if (err) return reject(err);

      // check if sql is SELECT statement
      if (_.isArray(records)) {
        resolve(records);
      } else {
        // sql is DML statement
        resolve({
          insertId: records.insertId,
          affectedRows: records.affectedRows
        });
      }
    });
  };

  return new Promise(resolver);
}

/**
 * Executes the given SQL statement.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} [options] query options.
 * @param {boolean} [options.nestTables] set to true to handle overlapping column names.
 * @param {boolean} [options.timeout] inactivity timeout in millis.
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
        // merge sql with options
        if (!_.isEmpty(options)) {
          sql = _.assign({sql: sql}, options);
        }
        // execute query
        return queryClient(client, sql, params)
          .finally(function () {
            // always release previously acquired client
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
    'SELECT table_name AS count',
    'FROM information_schema.tables',
    'WHERE table_schema = ?',
    'AND table_name = ?',
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
  var _this = this;
  var sql;
  var params;

  sql = 'SHOW FULL TABLES FROM ??;';
  params = [this.name];

  return this.query(sql, params)
    .filter(function (record) {
      return record.Table_type === 'BASE TABLE';
    })
    .map(function (record) {
      return record['Tables_in_' + _this.name];
    })
    .nodeify(callback);
};

// associate with MySQL Table class
Database.prototype.Table = Table;

// associate with MySQL Transaction class
Database.prototype.Transaction = Transaction;

module.exports = Database;
