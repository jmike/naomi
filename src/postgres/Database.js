var util = require('util');
var pg = require('pg.js');
var createPool = require('generic-pool').Pool;
var Promise = require('bluebird');
var type = require('type-of');
var _ = require('lodash');
var GenericDatabase = require('../Database');
var Table = require('./Table');
var Transaction = require('./Transaction');

/**
 * Creates new Postgres Database.
 * @param {object} props connection properties.
* @param {string} props.database the name of the database
 * @param {string} [props.host=localhost] optional hostname; defaults to "localhost"
 * @param {number} [props.port=3306] optional port number; defaults to 5432
 * @param {string} [props.user=root] optional user name to access the database; defaults to "root"
 * @param {string} [props.password] optional password to access the database; defaults to "" (empty string)
 * @param {number} [props.connectionLimit=10] optional maximum number of connections to maintain in the pool
 * @extends {GenericDatabase}
 * @throws {Error} if props is unspecified or invalid.
 * @constructor
 */
function Database(props) {
  // validate props argument
  if (!_.isPlainObject(props)) {
    throw new Error('Invalid props argument; expected object, received ' + type(props));
  }

  // handle optional props
  props = _.defaults(props, {
    host: 'localhost',
    port: 5432,
    user: 'root',
    password: '',
    connectionLimit: 10,
    poolIdleTimeout: 30000,
    reapIntervalMillis: 1000
  });

  // init GenericDatabase
  GenericDatabase.call(this, props);
  this._pool = null;
}

// @extends GenericDatabase
util.inherits(Database, GenericDatabase);
_.extend(Database, GenericDatabase);

/**
 * @extends {GenericDatabase#connect}
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
 * @extends {GenericDatabase#disconnect}
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
function _query(client, sql, params) {
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
function _prepareSQL(sql) {
  var re = /\?/g;
  var i = 0;

  return sql.replace(re, function () {
    i++;
    return '$' + i;
  });
}

/**
 * @extends {GenericDatabase#query}
 */
Database.prototype.query = function (sql, params, options, callback) {
  var _this = this;
  var resolver;

  // validate sql argument
  if (!_.isString(sql)) {
    throw new Error('Invalid sql argument; expected string, received ' + type(sql));
  }

  // handle optional params argument
  if (_.isFunction(params)) {
    callback = params;
    options = undefined;
    params = [];
  } else if (_.isPlainObject(params)) {
    callback = options;
    options = params;
    params = [];
  } else if (_.isUndefined(params)) {
    callback = undefined;
    options = undefined;
    params = [];
  }

  // validate params argument
  if (!_.isArray(params)) {
    throw new Error('Invalid params argument; expected array, received ' + type(params));
  }

  // handle optional options argument
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  } else if (_.isUndefined(options)) {
    callback = undefined;
    options = {};
  }

  // validate options argument
  if (!_.isPlainObject(options)) {
    throw new Error('Invalid options argument; expected object, received ' + type(options));
  }

  // define promise resolver
  resolver = function (resolve, reject) {
    // acquire client
    return _this.acquireClient()
      .then(function (client) {
        // replace "?" with "$#"
        sql = _prepareSQL(sql);
        // execute query
        return _query(client, sql, params)
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
 * @extends {GenericDatabase#hasTable}
 */
Database.prototype.hasTable = function (table, callback) {
  var sql;
  var params;

  // validate table argument
  if (!_.isString(table)) {
    throw new Error('Invalid table argument; expected string, received ' + type(table));
  }

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
 * @extends {GenericDatabase#getTables}
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
