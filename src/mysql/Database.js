var events = require('events'),
  util = require('util'),
  mysql = require('mysql'),
  _ = require('lodash'),
  async = require('async'),
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
  this.isReady = false;

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

  // connect to database
  if (!this.isConnected) {
    this._pool = mysql.createPool(this.connectionProperties);
    this.isConnected = true;

    this.emit('connect');
  }

  // load metadata
  if (!this.isReady) {
    this._bootstrap(defaultCallback);
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
    this.isReady = false;

    this.emit('disconnect');

  } else {
    callback();
  }

  return this;
};

/**
 * Retrieves table metadata from database.
 * @param {Function} cb a callback function i.e. function(err, tables).
 * @private
 */
Database.prototype._getTables = function (cb) {
  var schema = this.connectionProperties.database,
    sql, params;

  // compile parameterized SQL statement
  sql = 'SHOW FULL TABLES FROM ??;';
  params = [schema];

  // query the db
  this.query(sql, params, function (err, records) {
    var tables;

    if (err) return cb(err);

    tables = records.filter(function (record) {
      return record.Table_type === 'BASE TABLE';
    }).map(function (record) {
      return record['Tables_in_' + schema];
    });

    cb(null, tables);
  });
};

/**
 * Retrieves column metadata from database.
 * @param {Function} cb a callback function i.e. function(err, columns).
 * @private
 */
Database.prototype._getColumns = function (cb) {
  var schema = this.connectionProperties.database,
    sql, params;

  // compile parameterized SQL statement
  sql = 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = ?;';
  params = [schema];

  // query the db
  this.query(sql, params, function (err, records) {
    var columns;

    if (err) return cb(err);

    columns = records.map(function (record) {
      return {
        name: record.COLUMN_NAME,
        table: record.TABLE_NAME,
        type: record.DATA_TYPE,
        isNullable: record.IS_NULLABLE === 'YES',
        default: record.COLUMN_DEFAULT,
        collation: record.COLLATION_NAME,
        comment: _.isEmpty(record.COLUMN_COMMENT) ? null : record.COLUMN_COMMENT,
        position: record.ORDINAL_POSITION - 1 // zero-indexed
      };
    });

    cb(null, columns);
  });
};

/**
 * Retrieves index metadata from database.
 * @param {Function} cb a callback function i.e. function(err, indices).
 * @private
 */
Database.prototype._getIndices = function (cb) {
  var schema = this.connectionProperties.database,
    sql, params;

  // compile a parameterized SQL statement
  sql = 'SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = ?;';
  params = [schema];

  // run Forrest, run
  this.query(sql, params, function (err, records) {
    var indices;

    if (err) return cb(err);

    indices = records.map(function (record) {
      return {
        key: record.INDEX_NAME,
        table: record.TABLE_NAME,
        column: record.COLUMN_NAME,
        isUnique: record.NON_UNIQUE === 0
      };
    });

    cb(null, indices);
  });
};

/**
 * Loads metadata to memory and emits "ready".
 * @param {Function} callback a callback function i.e. function(err).
 * @private
 */
Database.prototype._bootstrap = function (callback) {
  var self = this;

  if (this.isReady) return callback(); // already bootstrapped

  async.parallel({

    tables: function(callback) {
      self._getTables(callback);
    },

    columns: function(callback) {
      self._getColumns(callback);
    },

    indices: function(callback) {
      self._getIndices(callback);
    }

  }, function (err, result) {
    if (err) return callback(err);

    // init tables
    result.tables.forEach(function (table) {
      self.tables[table] = {
        columns: {},
        primaryKey: [],
        uniqueKeys: {},
        indexKeys: {}
      };
    });

    // load columns
    result.columns.forEach(function (column) {
      var stack = self.tables[column.table];

      if (stack) {
        stack = stack.columns;
        stack[column.name] = column;
      }
    });

    // load indices
    result.indices.forEach(function (index) {
      var stack = self.tables[index.table];

      if (stack) {
        if (index.key === 'PRIMARY') {
          stack = stack.primaryKey;

        } else if (index.isUnique) {
          stack.uniqueKeys[index.key] = stack.uniqueKeys[index.key] || [];
          stack = stack.uniqueKeys[index.key];

        } else {
          stack.indexKeys[index.key] = stack.indexKeys[index.key] || [];
          stack = stack.indexKeys[index.key];
        }

        stack.push(index.column);
      }
    });

    self.isReady = true;
    self.emit('ready');

    callback();
  });
};

/**
 * Retrieves foreign key meta-data from database.
 * @param {Function} callback a callback function i.e. function(err, foreignKeys).
 * @private
 */
//Database.prototype._getForeignKeys = function (callback) {
//  var schema = this.connectionProperties.database,
//    sql, params;
//
//  // compile a parameterized SQL statement
//  sql = 'SELECT *' +
//    ' FROM information_schema.KEY_COLUMN_USAGE' +
//    ' WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_SCHEMA = ?;';
//  params = [schema, schema, this.table, schema, this.table, schema];
//
//  // run Forrest, run
//  this.query(sql, params, function (err, records) {
//    var foreignKeys = {};
//
//    if (err) return callback(err);
//
//    records.forEach(function (record) {
//      var column = {},
//        key, table;
//
//      key = record.CONSTRAINT_NAME;
//
//      if (record.TABLE_NAME === self.table) {
//        table = record.REFERENCED_TABLE_NAME;
//        column[record.COLUMN_NAME] = record.REFERENCED_COLUMN_NAME;
//      } else {
//        table = record.TABLE_NAME;
//        column[record.REFERENCED_COLUMN_NAME] = record.COLUMN_NAME;
//      }
//
//      foreignKeys[key] = foreignKeys[key] || {
//        referencedTable: table,
//        associatedColumns: []
//      };
//
//      foreignKeys[key].associatedColumns.push(column);
//    });
//
//    callback(null, foreignKeys);
//  });
//};

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

/**
 * Indicates whether the designated table exists in database.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} table the name of the table.
 * @returns {Boolean}
 */
Database.prototype.existsTable = function (table) {
  if (this.isReady) {
    return this.tables.hasOwnProperty(table);
  }

  return false;
};

module.exports = Database;
