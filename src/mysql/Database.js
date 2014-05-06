var events = require('events'),
  util = require('util'),
  mysql = require('mysql'),
  _ = require('lodash'),
  defaultCallback = require('../utils/defaultCallback'),
  Collection = require('./Collection');

/**
 * Constructs a new MySQL database.
 * @param {Object} connectionProperties connection properties.
 * @see https://github.com/felixge/node-mysql#connection-options for a list of connection properties to use.
 * @constructor
 */
function Database(connectionProperties) {
  this.connectionProperties = connectionProperties;
  this.tables = {};
  this.isConnected = false;

  events.EventEmitter.call(this);
  this.setMaxListeners(99);
}

// Database extends the EventEmitter class
util.inherits(Database, events.EventEmitter);

/**
 * Attempts to connect to database, using the connection properties given at construction time.
 * @param {Function} [callback] a callback function to execute when connection has been established, i.e. function (err).
 * @returns {Database} this instance, to enable method chaining.
 */
Database.prototype.connect = function (callback) {
  // handle optional "callback" param
  if (typeof callback !== 'function') {
    callback = defaultCallback;
  }

  if (!this.isConnected) {
    this._pool = mysql.createPool(this.connectionProperties);
    this.isConnected = true;

    this.emit('connect');
  }

  callback();

  return this;
};

/**
 * Gracefully closes all database connections.
 * The instance will become practically useless after calling this method, unless calling connect() again.
 * @param {Function} [callback] a callback function to execute when connection has been closed, i.e. function (err).
 * @returns {Database} this to enable method chaining.
 */
Database.prototype.disconnect = function (callback) {
  // handle optional "callback" param
  if (typeof callback !== 'function') {
    callback = defaultCallback;
  }

  if (this.isConnected) {
    this._pool.end(callback);
    this.isConnected = false;

    this.emit('disconnect');

  } else {
    callback();
  }

  return this;
};

/**
 * Runs the given SQL statement to the database.
 * @param {String} sql a parameterized SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {Object} [options] query options, i.e. {nestTables: true} to handle overlapping column names.
 * @param {Function} [callback] a callback function, i.e. function(error, records, meta) for SELECT statements and function(error, meta) for DML statements.
 */
Database.prototype.query = function (sql, params, options, callback) {
  var type;

  // make sure "sql" parameter is valid
  type = typeof(sql);

  if (type !== 'string') {
    throw new Error('You must specify a valid SQL statement');
  }

  // make sure "params" parameter is valid
  if (!_.isArray(params)) {
    type = typeof(params);

    if (_.isPlainObject(params)) {
      options = params;
    } else if (type === 'function') {
      callback = params;
    } else if (type !== 'undefined') { // not Array, nor Object, nor Function, nor undefined
      throw new Error('Invalid query parameters - expected array, received ' + type);
    }

    params = [];
  }

  // make sure "options" parameter is valid
  if (!_.isPlainObject(options)) {
    type = typeof(options);

    if (type === 'function') {
      callback = options;
    } else if (type !== 'undefined') { // not Object, nor Function, nor undefined
      throw new Error('Invalid query options - expected object, received ' + type);
    }

    options = {};
  }

  // make sure "callback" parameter is valid
  type = typeof(callback);

  if (type !== 'function') {
    if (type === 'undefined') {
      callback = defaultCallback;
    } else {
      throw new Error('Invalid callback - expected function, received ' + type);
    }
  }

  // make sure db is connected
  if (!this.isConnected) {
    return callback(new Error('Connection is closed - did you forget to call #connect()?'));
  }

  // get an available db connection
  this._pool.getConnection(function (err, connection) {
    if (err) return callback(err);

    // use the "nestTables" option Luke
    if (options.nestTables) {
      sql = {
        sql: sql,
        nestTables: options.nestTables
      };
    }

    // run Forrest, run
    connection.query(sql, params, function(error, records) {
      var meta = {};

      if (error) {
        callback(error);

      } else if (Array.isArray(records)) { // SELECT statement
        callback(null, records);

      } else { // DML statement
        meta.insertId = records.insertId;
        meta.affectedRows = records.affectedRows;

        callback(null, meta);
      }

      connection.release();
    });
  });
};

/**
 * Creates and returns a new data collection representing the designated table.
 * @param {String} table the name of an existing table in database.
 * @param {Object} [customProperties] the collection's custom properties.
 * Please note that this function will not create a new table on database.
 */
Database.prototype.extend = function (table, customProperties) {
  var collection;

  // make sure "table" parameter is valid
  if (typeof table !== 'string') {
    throw new Error('Invalid table name - expected string, received ' + typeof(table));
  }

  // create new collection
  collection = new Collection(this, table);

  // assign custom properties
  if (_.isPlainObject(customProperties)) {
    collection = _.extend(collection, customProperties);
  }

  return collection;
};

module.exports = Database;
