var util = require('util');
var mysql = require('mysql');
var _ = require('lodash');
var type = require('type-of');
var Promise = require('bluebird');
var GenericDatabase = require('../Database');
var Table = require('./Table');
var Transaction = require('./Transaction');

/**
 * Constructs a new MySQL Database client of the designated properties.
 * @param {object} props connection properties
 * @param {string} props.database the name of the database
 * @param {string} [props.host=localhost] optional hostname; defaults to "localhost"
 * @param {number} [props.port=3306] optional port number; defaults to 3306
 * @param {string} [props.user=root] optional user name to access the database; defaults to "root"
 * @param {string} [props.password] optional password to access the database; defaults to "" (empty string)
 * @param {number} [props.connectionLimit=10] optional maximum number of connections to maintain in the pool
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
    port: 3306,
    user: 'root',
    password: '',
    connectionLimit: 10
  });

  // init GenericDatabase
  GenericDatabase.call(this, props);
  this._pool = null;
}

// @extends GenericDatabase
util.inherits(Database, GenericDatabase);

/**
 * @extends GenericDatabase#connect
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
 * @extends Database#disconnect
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
 * @param {(String|Object)} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @returns {Promise} resolving to the query results.
 * @private
 * @static
 */
function _query(client, sql, params) {
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
        // merge sql with options, if the latter is specified
        if (!_.isEmpty(options)) sql = _.assign({sql: sql}, options);
        // execute query
        return _query(client, sql, params)
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

  // validate table argument
  if (!_.isString(table)) {
    throw new Error('Invalid table argument; expected string, received ' + type(table));
  }

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
 * Retrieves names of the tables in database.
 * @param {function} [callback] a callback function with (err, tables) arguments.
 * @returns {Promise}
 */
Database.prototype.getTables = function (callback) {
  var _this = this;

  var sql = 'SHOW FULL TABLES FROM ??;';
  var params = [this.name];

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
