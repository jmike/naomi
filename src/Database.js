var events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  async = require('async'),
  Collection = require('./Collection'),
  defaultCallback = require('./utils/defaultCallback');

/**
 * Constructs a new Database, i.e. an object representing a relational schema.
 * @param {Engine} engine a Naomi engine instance.
 * @constructor
 */
function Database(engine) {
  var self = this;

  this._engine = engine;
  this._tables = {};
  this.isConnected = false;
  this.isReady = false;

  events.EventEmitter.call(this);
  this.setMaxListeners(99);

  this.on('connect', function () {
    if (!self.isReady) self._loadMeta(defaultCallback);
  });
}

// Database extends the EventEmitter class
util.inherits(Database, events.EventEmitter);

/**
 * Attempts to connect to the database server.
 * @param {Function} [callback] a callback function to execute when connection has been established, i.e. function (err).
 * @returns {Database} this instance, to enable method chaining.
 */
Database.prototype.connect = function (callback) {
  // handle optional params
  if (typeof callback !== 'function') {
    callback = defaultCallback;
  }

  // connect to database
  if (!this.isConnected) {
    this._engine.connect(callback);
    this.isConnected = true;

    this.emit('connect');
  } else { // already connected
    callback();
  }

  return this;
};

/**
 * Gracefully closes any connection to the database server.
 * The instance will become practically useless after calling this method, unless calling connect() again.
 * @param {Function} [callback] a callback function to execute when connection has been closed, i.e. function (err).
 * @returns {Database} this to enable method chaining.
 */
Database.prototype.disconnect = function (callback) {
  // handle optional params
  if (typeof callback !== 'function') {
    callback = defaultCallback;
  }

  // disconnect from database
  if (this.isConnected) {
    this._engine.disconnect(callback);
    this.isConnected = false;
    this.isReady = false;

    this.emit('disconnect');
  } else { // already disconnected
    callback();
  }

  return this;
};

/**
 * Runs the given SQL statement to the database server.
 * @param {String} sql a parameterized SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {Object} [options] query options.
 * @param {Function} [callback] a callback function, i.e. function(error, records, meta) for SELECT statements and function(error, meta) for DML statements.
 */
Database.prototype.query = function (sql, params, options, callback) {
  var type;

  // validate "sql" param
  if (typeof sql !== 'string') {
    throw new Error('You must specify a valid SQL statement');
  }

  // handle optional "params" param
  if (!_.isArray(params)) {
    type = typeof(params);

    if (_.isPlainObject(params)) {
      options = params;
    } else if (type === 'function') {
      callback = params;
    } else if (params !== undefined) {
      throw new Error('Invalid parameters - expected an Array, received ' + type);
    }

    params = [];
  }

  // handle optional "options" param
  if (!_.isPlainObject(options)) {
    type = typeof(options);

    if (type === 'function') {
      callback = options;
    } else if (options !== undefined) {
      throw new Error('Invalid options param - expected object, received ' + type);
    }

    options = {};
  }

  // handle optional "callback" param
  type = typeof(callback);

  if (type !== 'function') {
    if (type !== 'undefined') {
      throw new Error('Invalid callback param - expected function, received ' + type);
    }

    callback = defaultCallback;
  }

  // make sure db is connected
  if (!this.isConnected) {
    return callback(new Error('Connection is closed - did you forget to call #connect()?'));
  }

  this._engine.query(sql, params, options, callback);
};

/**
 * Loads metadata from database server.
 * @param {Function} callback a callback function i.e. function(err).
 * @private
 */
Database.prototype._loadMeta = function (callback) {
  var self = this;

  async.parallel({
    tables: function(callback) {
      self._engine.getTables(callback);
    },
    columns: function(callback) {
      self._engine.getColumns(callback);
    },
    indices: function(callback) {
      self._engine.getIndices(callback);
    },
    foreignKeys: function(callback) {
      self._engine.getForeignKeys(callback);
    }
  }, function (err, result) {
    if (err) return callback(err);

    // init tables object
    result.tables.forEach(function (table) {
      self._tables[table] = {
        columns: {},
        primaryKey: [],
        uniqueKeys: {},
        indexKeys: {},
        related: {}
      };
    });

    // load columns
    result.columns.forEach(function (column) {
      var stack = self._tables[column.table];

      if (stack) {
        stack = stack.columns;
        stack[column.name] = column;
      }
    });

    // load indices
    result.indices.forEach(function (index) {
      var stack = self._tables[index.table];

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

    // load foreign keys
    result.foreignKeys.forEach(function (foreignKey) {
      var stack;

      stack = self._tables[foreignKey.table];
      if (stack) {
        stack.related[foreignKey.refTable] = stack.related[foreignKey.refTable] || {};
        stack = stack.related[foreignKey.refTable];
        stack[foreignKey.refColumn] = foreignKey.column;
      }

      // do the other side of the relation
      stack = self._tables[foreignKey.refTable];
      if (stack) {
        stack.related[foreignKey.table] = stack.related[foreignKey.table] || {};
        stack = stack.related[foreignKey.table];
        stack[foreignKey.column] = foreignKey.refColumn;
      }
    });

    self.isReady = true;
    self.emit('ready');

    callback();
  });
};

/**
 * Indicates whether the designated table exists in database.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} table the name of the table.
 * @returns {Boolean}
 */
Database.prototype.hasTable = function (table) {
  return this.isReady && this._tables.hasOwnProperty(table);
};

/**
 * Returns the designated table's metadata.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} table the name of the table.
 * @returns {Object|Null}
 */
Database.prototype.getTableMeta = function (table) {
  return this._tables[table] || null;
};

/**
 * Creates and returns a new data collection representing the designated table.
 * @param {String} table the name of an existing table in database.
 * @param {Object} [customProperties] the collection's custom properties.
 * Please note: this function will not create a new table on database - it will merely reference an existing one.
 */
Database.prototype.extend = function (table, customProperties) {
  var collection;

  // validate "table" param
  if (typeof table !== 'string') {
    throw new Error('Invalid table name - expected string, received ' + typeof(table));
  }

  // create new collection
  collection = new Collection(this, table);

  // extend with custom properties
  if (_.isPlainObject(customProperties)) {
    collection = _.extend(collection, customProperties);
  }

  return collection;
};

/**
 * Calculates and returns the shortest path from table A to table B.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} tableA the name of the table A.
 * @param {String} tableB the name of the table B.
 * @returns {Array<String>}
 */
Database.prototype.calculatePath = function (tableA, tableB, path, solutions) {
  var self = this;

  // handle optional path and solutions params
  path = path || [tableA];
  solutions = solutions || [];

  if (_.last(path) !== tableB) { // are we there yet?
    _.forOwn(this._tables[tableA].related, function (columns, table) {
      var arr = path.slice(0);

      if (arr.indexOf(table) === -1) { // avoid running in circles
        arr.push(table);
        self._calculatePath(table, tableB, arr, solutions);
      }
    });

  } else { // destination reached
    solutions.push(path);
  }

  // make sure solutions is not empty
  if (_.isEmpty(solutions)) return null;

  // return shortest path
  return _.min(solutions, function(solution) {
    return solution.length;
  });
};

module.exports = Database;
