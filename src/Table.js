var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var _ = require('lodash');

/**
 * Constructs a new Table instance.
 * @param {Database} db the database that the table belongs to.
 * @param {String} name the name of the table.
 * @constructor
 */
function Table (db, name) {
  this.db = db;
  this.name = name;
  this.columns = [];
  this.primaryKey = [];
  this.uniqueKeys = {};
  this.indexKeys = {};
  // this.foreignKeys = {};
  this.isReady = false;

  // init the EventEmitter
  EventEmitter.call(this);
  this.setMaxListeners(99);

  // load table metadata
  if (db.isConnected) {
    this._loadMeta();
  } else {
    // wait for db connection
    db.once('connect', this._loadMeta.bind(this));
  }
}

// @extends EventEmitter
util.inherits(Table, EventEmitter);

/**
 * Retrieves column metadata from database.
 * @param {Function} [callback] an optional callback function with (err, columns) arguments.
 * @returns {Promise} resolving to Array.<object>
 */
Table.prototype.getColumns = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Retrieves primary key metadata from database.
 * @param {Function} [callback] an optional callback function with (err, primaryKey) arguments.
 * @returns {Promise} resolving to Array.<string>
 */
Table.prototype.getPrimaryKey = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Retrieves unique key metadata from database.
 * @param {Function} [callback] an optional callback function with (err, uniqueKeys) arguments.
 * @returns {Promise} resolving to object
 */
Table.prototype.getUniqueKeys = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Retrieves index key metadata from database.
 * @param {Function} [callback] an optional callback function with (err, indexKeys) arguments.
 * @returns {Promise} resolving to object
 * @private
 */
Table.prototype.getIndexKeys = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Retrieves foreign key metadata from database.
 * @param {Function} [callback] an optional callback function with (err, foreignKeys) arguments.
 * @returns {Promise} resolving to object
 * @private
 */
Table.prototype.getForeignKeys = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Loads table metadata from database.
 * @param {function} [callback] an optional callback function with (err, foreignKeys) arguments.
 * @returns {Promise}
 * @emits Database#ready
 * @emits Database#error
 * @private
 */
Table.prototype._loadMeta = function (callback) {
  var _this = this;

  this.db.hasTable(this.name)
    .then(function (bool) {
      // make sure table exists in db
      if (!bool) {
        _this.emit('error', new Error('Table "' + _this.name + '" does not exist in database'));
        return;
      }
      // retrieve metadata
      return Promise.props({
        columns: _this.getColumns(),
        primaryKey: _this.getPrimaryKey(),
        uniqueKeys: _this.getUniqueKeys(),
        indexKeys: _this.getIndexKeys(),
        // foreignKeys: _this._getForeignKeys()
      });
    })
    // update table properties + emit @ready
    .then(function(results) {
      _this.columns = results.columns;
      _this.primaryKey = results.primaryKey;
      _this.uniqueKeys = results.uniqueKeys;
      _this.indexKeys = results.indexKeys;
      _this.foreignKeys = results.foreignKeys;
      _this.isReady = true;
      _this.emit('ready');
    })
    .nodeify(callback);
};

/**
 * Indicates whether the specified column exists in table.
 * This method will always return false until database is ready.
 * @param {string} name the name of the column.
 * @returns {boolean}
 * @example
 *
 * table.hasColumn('id');
 */
Table.prototype.hasColumn = function (name) {
  return this.columns.some(function (column) {
    return column.name === name;
  });
};

/**
 * Indicates whether the specified column(s) represent a primary key.
 * Primary keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params in this function.
 * This method will always return false until database is ready.
 * @param {...string} columns the name of the columns.
 * @returns {boolean}
 * @example
 *
 * table.isPrimaryKey('id');
 */
Table.prototype.isPrimaryKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0);
  return _.xor(this.primaryKey, columns).length === 0;
};

/**
 * Indicates whether the specified column(s) represent a unique key.
 * Unique keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * This method will always return false until database is ready.
 * @param {...string} columns the name of the columns.
 * @returns {boolean}
 * @example
 *
 * table.isUniqueKey('pid');
 */
Table.prototype.isUniqueKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0);
  return _.some(this.uniqueKeys, function (e) {
    return _.xor(e, columns).length === 0;
  });
};

/**
 * Indicates whether the specified column(s) represent an index key.
 * Index keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * This method will always return false until database is ready.
 * @param {...string} columns the name of the columns.
 * @returns {boolean}
 * @example
 *
 * table.isIndexKey('firstName', 'lastName');
 */
Table.prototype.isIndexKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0);
  return _.some(this.indexKeys, function (e) {
    return _.xor(e, columns).length === 0;
  });
};

/**
 * Indicates whether the specified column is automatically incremented.
 * This method will always return false until database is ready.
 * @param {string} columnName the name of the column.
 * @returns {boolean}
 * @example
 *
 * table.isAutoInc('id');
 */
Table.prototype.isAutoInc = function (columnName) {
  return this.columns.some(function (column) {
    return column.isAutoInc && column.name === columnName;
  });
};

/**
 * Enqueues the given resolver function until the Table is ready.
 * Executes the resolver immediately after connection.
 * @param {function} resolver
 * @return {Promise}
 * @private
 */
Table.prototype._enqueue = function (resolver) {
  var _this = this;

  return new Promise(function(resolve, reject) {
    if (_this.isReady) {
      resolver(resolve, reject);
    } else {
      // wait for table to load metadata
      _this.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  });
};

/**
 * Retrieves the designated record(s) from this table.
 * @param {(Boolean|Number|String|Date|Object|Array.<Object>)} [query] a query object.
 * @param {Function} [callback] an optional callback function
 * @returns {Promise} resolving to an Array of records
 */
Table.prototype.get = function (query, callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Counts the designated record(s) in this table.
 * @param {(Boolean|Number|String|Date|Object|Array.<Object>)} [query] a query object.
 * @param {Function} [callback] an optional callback function
 * @returns {Promise} resolving to the count of records
 */
Table.prototype.count = function (query, callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Deletes the designated record(s) from this table.
 * @param {(Boolean|Number|String|Date|Object|Array.<Object>)} [query] a query object.
 * @param {Function} [callback] an optional callback function
 * @returns {Promise}
 */
Table.prototype.del = function (query, callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Creates or updates (if already exists) the specified record(s) in table.
 * @param {(Object|Array.<Object>)} attrs the attributes of the record(s) to create/update
 * @param {Object} options query options
 * @param {Function} [callback] an optional callback function
 * @returns {Promise} resolving to the primary key of the created/updated record(s)
 */
Table.prototype.set = function (attrs, options, callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Creates the specified record(s) in table.
 * @param {(Object|Array.<Object>)} attrs the attributes of the record(s) to create
 * @param {Object} options query options
 * @param {Function} [callback] an optional callback function
 * @returns {Promise} resolving to the primary key of the created record(s).
 */
Table.prototype.add = function (attrs, options, callback) {
  return Promise.resolve().nodeify(callback);
};

module.exports = Table;
