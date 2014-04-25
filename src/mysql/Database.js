var events = require('events'),
  util = require('util'),
  mysql = require('mysql'),
  _ = require('lodash'),
  async = require('async'),
  Collection = require('./Collection');

/**
 * A default callback function that throws an error when necessary.
 * @param {Error} error.
 * @private
 */
function defaultCallback(error) {
  if (error) throw error;
}

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
  this.isReady = false;

  events.EventEmitter.call(this);
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

  if (!this.isReady) {
    this._bootstrap(function (err) {
      if (err) throw err;

      this.emit('ready');
    });
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
 * Retrieves table information.
 * @param {Function} callback a callback function i.e. function(err, info).
 * @private
 */
Database.prototype._getTableInfo = function (callback) {
  var sql = 'SHOW FULL TABLES;';

  this.query(sql, function (err, records, meta) {
    var k, tables;

    if (err) return callback(err);

    k = meta.fields[0].name;
    tables = records
      .filter(function (record) {
        return record.Table_type === 'BASE TABLE';
      })
      .map(function (record) {
        return record[k];
      });

    callback(null, tables);
  });
};

/**
 * Retrieves index information for the designated table.
 * @param {Function} callback a callback function i.e. function(err, info).
 * @private
 */
Database.prototype._getIndexInfo = function (table, callback) {
  var sql, params;

  sql = 'SHOW INDEX FROM ??;';
  params = [table];

  this.query(sql, params, function (err, records) {
    var info = {
      primaryKey: [],
      uniqueKeys: {},
      indexKeys: {},
    };

    if (err) return callback(err);

    records.forEach(function (record) {
      var key, column, isUnique, stack;

      key = record.Key_name;
      column = record.Column_name;
      isUnique = record.Non_unique === 0;

      if (key === 'PRIMARY') {
        stack = info.primaryKey;

      } else if (isUnique) {
        info.uniqueKeys[key] = info.uniqueKeys[key] || [];
        stack = info.uniqueKeys[key];

      } else {
        info.indexKeys[key] = info.indexKeys[key] || [];
        stack = info.indexKeys[key];
      }

      stack.push(column);
    });

    callback(null, info);
  });
};

/**
 * Retrieves table and index information from database.
 * @param {Function} callback a callback function i.e. function(err).
 * @private
 */
Database.prototype._bootstrap = function (callback) {
  var self = this;

  this._getTableInfo(function (err, tables) {

    if (err) return callback(err);

    async.each(tables, function (table, callback) {

      self._getIndexInfo(table, function(err, info) {
        if (err) return callback(err);

        self.tables[table] = info;
      });

    }, callback);
  });
};

/**
 * Runs the given SQL statement to the database.
 * @param {String} sql a parameterized SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {Object} [options] query options, i.e. {nestTables: true} to handle overlapping column names.
 * @param {Function} [callback] a callback function, i.e. function(error, records, meta) for SELECT statements and function(error, meta) for DML statements.
 */
Database.prototype.query = function (sql, params, options, callback) {
  // make sure "sql" parameter is valid
  if (typeof sql !== 'string') {
    throw new Error('You must specify a valid SQL statement');
  }

  // make sure "params" parameter is valid
  switch (typeof params) {
  case 'object':
    if (!Array.isArray(params)) { // plain object
      options = params;
      params = [];
    }
    break;
  case 'function':
    callback = params;
    params = [];
    break;
  case 'undefined':
    params = [];
    break;
  default: // not Array, nor Object, nor Function, nor undefined
    throw new Error('Invalid query parameters - expected array, received ' + typeof(callback));
  }

  // make sure "options" parameter is valid
  switch (typeof options) {
  case 'object':
    // as expected
    break;
  case 'function':
    callback = options;
    options = null;
    break;
  case 'undefined':
    options = null;
    break;
  default: // not Object, nor Function, nor undefined
    throw new Error('Invalid query options - expected object, received ' + typeof(callback));
  }

  // make sure "callback" parameter is valid
  switch (typeof callback) {
  case 'function':
    // as expected
    break;
  case 'undefined':
    callback = defaultCallback;
    break;
  default: // not Function, nor undefined
    throw new Error('You must specify a proper callback function');
  }

  // check if connected
  if (!this.isConnected) {
    return callback(new Error('Connection is closed - did you forget to call #connect()?'));
  }

  // use the options, Luke
  if (options) {
    sql = _.extend(options, {sql: sql});
  }

  // query the db
  this._pool.getConnection(function (error, connection) {
    if (error) return callback(error);

    connection.query(sql, params, function(error, records, fields) {
      var meta;

      if (error) {
        callback(error);

      } else if (Array.isArray(records)) { // SELECT statement
        meta = {fields: fields};

        callback(null, records, meta);

      } else { // DML statement
        meta = {
          insertId: records.insertId,
          affectedRows: records.affectedRows
        };

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
    throw new Error('Invalid table name');
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
