var events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  Collection = require('./Collection'),
  defaultCallback = require('./utils/defaultCallback');

/**
 * Constructs a new Database, i.e. an object representing a relational database.
 * @param {Engine} engine a Naomi engine instance.
 * @constructor
 */
function Database(engine) {
  this.engine = engine;
  this.tables = {};
  this.isConnected = false;
  this.isReady = false;

  events.EventEmitter.call(this);
  this.setMaxListeners(99);

  this.on('connect', function () {
    if (this.isReady) return; // already there

    this._fetchMeta()
      .bind(this)
      .then(function (tables) {
        this.tables = tables;
        this.isReady = true;
        this.emit('ready');
      });
  });
}

// Database extends the EventEmitter class
util.inherits(Database, events.EventEmitter);

/**
 * Attempts to connect to the database server.
 * @param {Function} [callback] a callback function to execute when connection has been established, i.e. function (err).
 * @returns {Promise}
 */
Database.prototype.connect = function (callback) {
  if (this.isConnected) { // already connected
    return Promise.resolve().nodeify(callback);
  }

  return this.engine.connect()
    .bind(this)
    .then(function () {
      this.isConnected = true;
      this.emit('connect');
      return;
    })
    .nodeify(callback);
};

/**
 * Gracefully closes any connection to the database server.
 * The instance will become practically useless after calling this method, unless calling connect() again.
 * @param {Function} [callback] a callback function to execute when connection has been closed, i.e. function (err).
 * @returns {Promise}
 */
Database.prototype.disconnect = function (callback) {
  if (!this.isConnected) { // already disconnected
    return Promise.resolve().nodeify(callback);
  }

  this.engine.disconnect()
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
 * @param {String} sql a parameterized SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {Object} [options] query options.
 * @param {Function} [callback] a callback function, i.e. function(error, records, meta) for SELECT statements and function(error, meta) for DML statements.
 * @throws {Error} if parameters are invalid.
 * @returns {Promise}
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
    } else if (type !== 'undefined') {
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

  if (!this.isConnected) { // make sure db is connected
    return Promise.reject('Connection is closed - did you forget to call #connect()?')
      .nodeify(callback);
  }

  return this.engine.query(sql, params, options).nodeify(callback);
};

/**
 * Extracts and returns metadata from database server.
 * @returns {Promise}
 * @private
 */
Database.prototype._fetchMeta = function () {
  return Promise.props({
    tables: this.engine.getTables(),
    columns: this.engine.getColumns(),
    indices: this.engine.getIndices(),
    foreignKeys: this.engine.getForeignKeys()
  }).then(function(result) {
    var tables = {};

    // init tables object
    result.tables.forEach(function (table) {
      tables[table] = {
        columns: {},
        primaryKey: [],
        uniqueKeys: {},
        indexKeys: {},
        related: {}
      };
    });

    // set columns in table(s)
    result.columns.forEach(function (column) {
      var table = tables[column.table];
      table.columns[column.name] = column;
    });

    // set indices in table(s)
    result.indices.forEach(function (index) {
      var table = tables[index.table];

      if (index.key === 'PRIMARY') {
        table.primaryKey.push(index.column);

      } else if (index.isUnique) {
        table.uniqueKeys[index.key] = table.uniqueKeys[index.key] || [];
        table.uniqueKeys[index.key].push(index.column);

      } else {
        table.indexKeys[index.key] = table.indexKeys[index.key] || [];
        table.indexKeys[index.key].push(index.column);
      }
    });

    // set foreign keys in table(s)
    result.foreignKeys.forEach(function (foreignKey) {
      var table = tables[foreignKey.table];

      table.related[foreignKey.refTable] = table.related[foreignKey.refTable] || {};
      table.related[foreignKey.refTable][foreignKey.refColumn] = foreignKey.column;

      // do the other side of the relation
      table = tables[foreignKey.refTable];

      table.related[foreignKey.table] = table.related[foreignKey.table] || {};
      table.related[foreignKey.table][foreignKey.column] = foreignKey.refColumn;
    });

    return tables;
  });
};

/**
 * Indicates whether the designated table exists in database.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} table the name of the table.
 * @returns {Boolean}
 */
Database.prototype.hasTable = function (table) {
  return this.isReady && this.tables.hasOwnProperty(table);
};

/**
 * Returns the designated table's metadata.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} table the name of the table.
 * @returns {Object|Null}
 */
Database.prototype.getTableMeta = function (table) {
  return this.tables[table] || null;
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
 * Returns the shortest path from table A to table B.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} tableA the name of the table A.
 * @param {String} tableB the name of the table B.
 * @returns {Array<String>}
 */
Database.prototype.findPath = function (tableA, tableB, path, solutions) {
  // handle optional "path" param
  path = path || [tableA];

  // handle optional "solutions" param
  solutions = solutions || [];

  // main logic (this is Sparta)
  if (_.last(path) !== tableB) { // are we there yet?
    _.forOwn(this.tables[tableA].related, function (columns, table) {
      var arr = path.slice(0);

      if (arr.indexOf(table) === -1) { // avoid running in circles
        arr.push(table);
        this.findPath(table, tableB, arr, solutions);
      }
    }, this);

  } else { // destination reached
    solutions.push(path);
  }

  // make sure solutions is not empty
  if (_.isEmpty(solutions)) {
    return null;
  }

  // return shortest path
  return _.min(solutions, function(solution) {
    return solution.length;
  });
};

module.exports = Database;
