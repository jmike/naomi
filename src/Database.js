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
  this._meta = {};

  this.isConnected = false;
  this.isReady = false;

  events.EventEmitter.call(this);
  this.setMaxListeners(99);

  this.on('connect', function () {
    if (this.isReady) return; // exit

    engine.getMetaData()
      .bind(this)
      .then(function (meta) {
        this._meta = meta;
        this.isReady = true;
        this.emit('ready');
      });
  });
}

// Database extends the EventEmitter class
util.inherits(Database, events.EventEmitter);

/**
 * Attempts to connect to the database server.
 * @param {Function} [callback] an optional callback function, i.e. function (err) {}.
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
 * The instance will become practically useless after calling this method.
 * @param {Function} [callback] an optional callback function, i.e. function (err) {}.
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
 * Indicates whether the designated table exists in database.
 * This method will always return false until the database is ready.
 * @param {String} tableName the name of the table.
 * @returns {Boolean}
 */
Database.prototype.hasTable = function (tableName) {
  return this.isReady && this._meta.hasOwnProperty(tableName);
};

/**
 * Returns the designated table's metadata.
 * This method will always return null until the database is ready.
 * @param {String} tableName the name of the table.
 * @returns {Object|null}
 */
Database.prototype.getTableMeta = function (tableName) {
  return this._meta[tableName] || null;
};

/**
 * Returns a new Table, extended with the given properties and methods.
 * This function will not create a new table on database - it will merely reference an existing one.
 * @param {String} name the name of the table in database.
 * @param {Object} [customProperties] the table's custom properties and methods.
 * @returns {Table}
 */
Database.prototype.extend = function (name, customProperties) {
  var table;

  // validate "name" param
  if (typeof name !== 'string') {
    throw new Error('Invalid or unspecified table name');
  }

  // create new table
  table = new Table(this, name);

  // extend with custom properties
  if (_.isPlainObject(customProperties)) {
    table = _.extend(table, customProperties);
  }

  return table;
};

/**
 * Returns the shortest path from table A to table B.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} tableA the name of the table A.
 * @param {String} tableB the name of the table B.
 * @returns {Array<String>, null}
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
