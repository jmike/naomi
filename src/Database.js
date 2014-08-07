var events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  Table = require('./Table');

/**
 * Constructs a new Database, i.e. an object representing a relational database.
 * @param {Engine} engine a Naomi engine instance.
 * @extends {EventEmitter}
 * @emits Database#connect when connected to the database server.
 * @emits Database#disconnect when disconnected from the database server.
 * @emits Database#ready when metadata have been loaded.
 * @constructor
 */
function Database(engine) {
  this._engine = engine;
  this._tables = {};
  this.isConnected = false;
  this.isReady = false;

  events.EventEmitter.call(this);
  this.setMaxListeners(99);

  this.on('connect', function () {
    if (this.isReady) return; // exit

    this._fetchMeta()
      .bind(this)
      .then(function (tables) {
        this._tables = tables;
        this.isReady = true;
        this.emit('ready');
      });
  });
}

// Database extends the EventEmitter class
util.inherits(Database, events.EventEmitter);

/**
 * Attempts to connect to the database server.
 * @param {Function} [callback] an optional callback function, i.e. function (err).
 * @returns {Promise}
 * @emits Database#connect
 */
Database.prototype.connect = function (callback) {
  if (this.isConnected) { // already connected
    return Promise.resolve().nodeify(callback);
  }

  return this._engine.connect()
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
 * The database will become practically useless after calling this method.
 * @param {Function} [callback] an optional callback function, i.e. function (err).
 * @returns {Promise}
 * @emits Database#disconnect
 */
Database.prototype.disconnect = function (callback) {
  if (!this.isConnected) { // already disconnected
    return Promise.resolve().nodeify(callback);
  }

  this._engine.disconnect()
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
 * @param {Function} [callback] a callback function, i.e. function(err, records).
 * @returns {Promise}
 */
Database.prototype.query = function (sql, params, options, callback) {
  // validate "sql" param
  if (!_.isString(sql)) {
    return Promise.reject('Invalid or unspecified sql param').nodeify(callback);
  }

  // handle optional "params" param
  if (!_.isArray(params)) {

    if (_.isPlainObject(params)) {
      options = params;
    } else if (_.isFunction(params) === 'function') {
      options = undefined;
      callback = params;
    } else if (!_.isUndefined(params)) {
      return Promise.reject('Invalid or unspecified query parameters').nodeify(callback);
    }

    params = [];
  }

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid or unspecified options param').nodeify(callback);
    }

    options = {};
  }

  // make sure db is connected
  if (!this.isConnected) {
    return Promise.reject('Connection is closed - did you forget to call #connect()?').nodeify(callback);
  }

  // run the query
  return this._engine.query(sql, params, options).nodeify(callback);
};

/**
 * Extracts and returns metadata from database server.
 * @returns {Promise}
 * @private
 */
Database.prototype._fetchMeta = function () {
  return Promise.props({
    tables: this._engine.getTables(),
    columns: this._engine.getColumns(),
    indices: this._engine.getIndices(),
    foreignKeys: this._engine.getForeignKeys()
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
 * This method will always return false until database is ready.
 * @param {String} tableName the name of the table.
 * @returns {Boolean}
 */
Database.prototype.hasTable = function (tableName) {
  return this.isReady && this._tables.hasOwnProperty(tableName);
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
 * Returns a new Table, extended with the supplied methods.
 * Please note: this function will not create a new table on database - it will merely reference an existing one.
 * @param {String} name the name of the table in database.
 * @param {Object} [props] the table's custom methods and properties.
 * @returns {Table}
 */
Database.prototype.extend = function (name, props) {
  var table;

  // validate "name" param
  if (typeof name !== 'string') {
    throw new Error('Invalid or unspecified table name');
  }

  // create new table
  table = new Table(this, name);

  // extend with custom properties
  if (_.isPlainObject(props)) {
    table = _.extend(table, props);
  }

  return table;
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
    _.forOwn(this._tables[tableA].related, function (columns, table) {
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
