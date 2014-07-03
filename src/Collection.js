var _ = require('lodash'),
  async = require('async');

/**
 * Constructs a new Collection, i.e. an object representing a MySQL table.
 * @param {Database} db a Naomi database instance.
 * @param {String} table the name of a table in database.
 * @constructor
 */
function Collection(db, table) {
  var self = this,
    queue;

  this.db = db;
  this.table = table;

  this.columns = {};
  this.primaryKey = [];
  this.uniqueKeys = {};
  this.indexKeys = {};

  // setup queue to stack queries until db is ready
  queue = async.queue(function (task, callback) {
    task();
    callback();
  }, 10);
  queue.pause(); // pause by default
  this._queue = queue;

  db.on('ready', function () {
    self._loadMeta();
    self._queue.resume();
  });

  db.on('disconnect', function () {
    self._queue.pause();
  });

  // check if db is already loaded
  if (db.isReady) {
    this._loadMeta();
  }
}

/**
 * Loads metadata from database.
 * @private
 */
Collection.prototype._loadMeta = function () {
  var meta = this.db.getTableMeta(this.table);

  if (meta) {
    this.columns = meta.columns;
    this.primaryKey = meta.primaryKey;
    this.uniqueKeys = meta.uniqueKeys;
    this.indexKeys = meta.indexKeys;
  }
};

/**
 * Indicates whether the specified column exists in the collection.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} column the name of the column.
 * @returns {Boolean}
 * @example
 *
 * collection.hasColumn('name');
 */
Collection.prototype.hasColumn = function (column) {
  return this.columns.hasOwnProperty(column);
};

/**
 * Indicates whether the specified column(s) represent a primary key.
 * Primary keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params in this function.
 * Please note: this method is meant to be called after the database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * collection.isPrimaryKey('id');
 */
Collection.prototype.isPrimaryKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0);
  return _.xor(this.primaryKey, columns).length === 0;
};

/**
 * Indicates whether the specified column(s) represent a unique key.
 * Unique keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after the database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * collection.isUniqueKey('pid');
 */
Collection.prototype.isUniqueKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this.uniqueKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit once verdict is true (return false breaks the loop)
  });

  return verdict;
};

/**
 * Indicates whether the specified column(s) represent an index key.
 * Index keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after the database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * collection.isIndexKey('firstName', 'lastName');
 */
Collection.prototype.isIndexKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this.indexKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit once verdict is true (return false breaks the loop)
  });

  return verdict;
};

/**
 * Retrieves the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} selector a selector to match the record(s) in database.
 * @param {Object} [options]
 * @param {Function} callback a callback function i.e. function(err, data).
 */
Collection.prototype.get = function (selector, options, callback) {
  var stmt, type;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.get.bind(this, selector, options, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) {
    return callback(new Error('Table "' + this.table + '" cannot be found in database'));
  }

  // validate params
  type = typeof(selector);
  if (
    type !== 'boolean' &&
    type !== 'number' &&
    type !== 'string' &&
    !_.isPlainObject(selector) &&
    !Array.isArray(selector) &&
    !_.isDate(selector)
  ) {
    throw new Error('Invalid selector');
  }

  if (!_.isPlainObject(options)) {
    type = typeof(options);

    if (type === 'function') {
      callback = options;
    } else if (options) { // non nullable
      throw new Error('Invalid options - expected object, received ' + type);
    }

    options = {};
  }

  type = typeof(callback);
  if (type !== 'function' && type !== 'undefined') {
    throw new Error('Invalid callback - expected function, received ' + type);
  }

  // compile select statement
  stmt = {};

  // run Forrest, run
  this.db.query(stmt.sql, stmt.params, callback);
};

/**
 * Retrieves all record(s) from database.
 * @param {Object} [options]
 * @param {Function} callback a callback function i.e. function(err, data).
 */
Collection.prototype.all = function (options, callback) {
  this.get(null, options, callback);
};

/**
 * Counts the designated record(s) in database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} [selector] a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(err, count).
 */
Collection.prototype.count = function (selector, callback) {
  var stmt;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.count.bind(this, selector, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) {
    return callback('Table "' + this.table + '" cannot be found in database');
  }

  // handle optional "selector" param
  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  // compile a parameterized SELECT COUNT statement
  stmt = {};

  // run Forrest, run
  this.db.query(stmt.sql, stmt.params, function (error, records) {
    var count;

    if (error) return callback(error);
    count = records[0].count; // we need only the number

    callback(null, count);
  });
};

/**
 * Creates or updates the specified record in database.
 * @param {Object} attrs the record attributes.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.set = function (attrs, callback) {
  var stmt;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.set.bind(this, attrs, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) {
    return callback('Table "' + this.table + '" cannot be found in database');
  }

  // compile upsert statement
  stmt = {};

  // run Forrest, run
  this.db.query(stmt.sql, stmt.params, callback);
};

/**
 * Deletes the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} selector a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.del = function (selector, callback) {
  var stmt, type;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.del.bind(this, selector, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) {
    return callback('Table "' + this.table + '" cannot be found in database');
  }

  // validate params
  type = typeof(selector);
  if (
    type !== 'boolean' &&
    type !== 'number' &&
    type !== 'string' &&
    !_.isPlainObject(selector) &&
    !Array.isArray(selector) &&
    !_.isDate(selector)
  ) {
    throw new Error('Invalid selector');
  }

  type = typeof(callback);
  if (type !== 'function' && type !== 'undefined') {
    throw new Error('Invalid callback - expected function, received ' + type);
  }

  // compile a parameterized DELETE statement
  stmt = {};

  // run Forrest, run
  this.db.query(stmt.sql, stmt.params, callback);
};

module.exports = Collection;