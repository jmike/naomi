var events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  Table = require('./Table'),
  Transaction = require('./Transaction');

/**
 * Constructs a new database of the designated properties.
 * Please note: additional connection properties may apply depending on the database type.
 * @see {@link https://github.com/felixge/node-mysql#connection-options} for MySQL additional properties.
 * @see {@link https://github.com/brianc/node-postgres/wiki/Client#constructor} for Postgres additional properties.
 * @param {object} props connection properties.
 * @param {string} props.host the hostname of the database.
 * @param {(string|number)} props.port the port number of the database.
 * @param {string} props.user the user to access the database.
 * @param {string} props.password the password of the user.
 * @param {string} props.database the name of the database.
 * @param {number} props.poolSize=10 number of unique Client objects to maintain in the pool.
 * @param {number} props.poolIdleTimeout=30000 max milliseconds a client can go unused before it is removed from the pool and destroyed.
 * @param {number} props.reapIntervalMillis=1000 frequency to check for idle clients within the client pool.
 * @throws {Error} if params are invalid or unspecified.
 * @constructor
 */
function Database(props) {
  // validate "props" param
  if (!_.isPlainObject(props)) {
    throw new Error('Invalid connection properties: expected plain object, received ' + typeof(props));
  }

  // handle optional connection properties
  props.poolSize = props.poolSize || 10;
  props.poolIdleTimeout = props.poolIdleTimeout || 30000;
  props.reapIntervalMillis = props.reapIntervalMillis || 1000;

  // set database properties
  this.isConnected = false;
  this.isReady = false;
  this.connectionProperties = props;
  this._meta = {};

  // init the EventEmitter
  events.EventEmitter.call(this);
  this.setMaxListeners(99);

  // load metadata from database server
  this.on('connect', function () {
    this._extractMeta()
      .bind(this)
      .then(function (meta) {
        this._meta = meta;
        this.isReady = true;
        this.emit('ready');
      });
  });
}

// Database extends EventEmitter
util.inherits(Database, events.EventEmitter);

// associate with Table class
Database.prototype.Table = Table;

// associate with Transaction class
Database.prototype.Transaction = Transaction;

/**
 * Attempts to connect to database server using the connection properties supplied at construction time.
 * @returns {Promise}
 * @private
 */
Database.prototype._connect = function () {
  return Promise.resolve();
};

/**
 * Attempts to connect to database server using the connection properties supplied at construction time.
 * @param {function} [callback] an optional callback function, i.e. function (err) {}.
 * @returns {Promise}
 * @emits Database#connect
 */
Database.prototype.connect = function (callback) {
  if (this.isConnected) { // already connected
    return Promise.resolve().nodeify(callback);
  }

  return this._connect()
    .bind(this)
    .then(function () {
      this.isConnected = true;
      this.emit('connect');
      return;
    })
    .nodeify(callback);
};

/**
 * Gracefully closes any open connection to the database server.
 * @returns {Promise}
 * @private
 */
Database.prototype._disconnect = function () {
  return Promise.resolve();
};

/**
 * Gracefully closes any open connection to the database server.
 * Please note: this instance will become practically useless after calling this method.
 * @param {function} [callback] an optional callback function, i.e. function (err) {}.
 * @returns {Promise}
 * @emits Database#disconnect
 */
Database.prototype.disconnect = function (callback) {
  if (!this.isConnected) { // already disconnected
    return Promise.resolve().nodeify(callback);
  }

  this._disconnect()
    .bind(this)
    .then(function () {
      this.isConnected = false;
      this.isReady = false;
      this.emit('disconnect');
      return;
    })
    .nodeify(callback);
};

/**
 * Runs the given SQL statement to the database server.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} options query options.
 * @returns {Promise} resolving to the query results.
 * @private
 */
Database.prototype._query = function (sql, params, options) {
  return Promise.resolve(sql, params, options);
};

/**
 * Runs the given SQL statement to the database server.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {object} [options] query options.
 * @param {function} [callback] a callback function, i.e. function(err, records).
 * @returns {Promise} resolving to the query results.
 */
Database.prototype.query = function (sql, params, options, callback) {
  // validate "sql" param
  if (!_.isString(sql)) {
    return Promise.reject('Invalid SQL statement: expected string, received ' + typeof(sql)).nodeify(callback);
  }

  // handle optional "params" param
  if (!_.isArray(params)) {

    if (_.isPlainObject(params)) {
      options = params;
    } else if (_.isFunction(params)) {
      options = undefined;
      callback = params;
    } else if (!_.isUndefined(params)) {
      return Promise.reject('Invalid query parameters: expected Array, received ' + typeof(params)).nodeify(callback);
    }

    params = [];
  }

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid query options: expected plain object, received ' + typeof(options)).nodeify(callback);
    }

    options = {};
  }

  // make sure db is connected
  if (!this.isConnected) {
    return Promise.reject('Connection is closed - did you forget to call #connect()?')
      .nodeify(callback);
  }

  // execute the query
  return this._query(sql, params, options).nodeify(callback);
};

/**
 * Begins a new transaction with this database.
 * @param {function} [callback] a callback function.
 * @returns {Promise} resolving to a new Transaction instance.
 */
Database.prototype.beginTransaction = function (callback) {
  var t = new this.Transaction(this);
  return t.begin().then(function () {
    return t;
  }).nodeify(callback);
};

/**
 * Extracts and returns meta-data from database.
 * @returns {Promise} resolving to a meta-data object.
 * @private
 */
Database.prototype._extractMeta = function () {
  return {};
};

/**
 * Indicates whether the designated table exists in database.
 * Please note: this method will always return false until the database is ready.
 * @param {string} tableName the name of the table.
 * @returns {boolean}
 */
Database.prototype.hasTable = function (tableName) {
  return this.isReady && this._meta.hasOwnProperty(tableName);
};

/**
 * Returns the designated table's metadata.
 * Please note: this method will always return null until the database is ready.
 * @param {string} tableName the name of the table.
 * @returns {(object|null)}
 */
Database.prototype.getTableMeta = function (tableName) {
  return this._meta[tableName] || null;
};

/**
 * Returns a new Table, extended with the given properties and methods.
 * Please note: this method will not create a new table on database - it will merely reference an existing one.
 * @param {string} tableName the name of the table in database.
 * @param {object} [customProperties] the table's custom properties and methods.
 * @returns {Table}
 */
Database.prototype.extend = function (tableName, customProperties) {
  var table;

  // validate "tableName" param
  if (!_.isString(tableName)) {
    throw new Error('Invalid table name: expected string, received ' + typeof(tableName));
  }

  // create table
  table = new this.Table(this, tableName);

  // extend with custom properties
  if (_.isPlainObject(customProperties)) {
    table = _.extend(table, customProperties);
  }

  return table;
};

/**
 * Returns the shortest path from table A to table B.
 * Please note: this method is meant to be called after the database is ready.
 * @param {string} tableA the name of the table A.
 * @param {string} tableB the name of the table B.
 * @returns {(Array.<string>|null)}
 */
Database.prototype.findPath = function (tableA, tableB, path, solutions) {
  // check if database is ready
  if (!this.isReady) return null;

  // handle optional "path" param
  path = path || [tableA];

  // handle optional "solutions" param
  solutions = solutions || [];

  // this is Sparta...
  if (_.last(path) !== tableB) { // are we there yet?
    _.forOwn(this._meta[tableA].refTables, function (columns, table) {
      var arr = path.slice(0);

      if (arr.indexOf(table) === -1) { // avoid running in circles
        arr.push(table);
        this.findPath(table, tableB, arr, solutions);
      }
    }, this);

  } else { // destination reached
    solutions.push(path);
  }

  // check if solutions is empty
  if (solutions.length === 0) return null;

  // return shortest path
  return _.min(solutions, function(solution) {
    return solution.length;
  });
};

module.exports = Database;
