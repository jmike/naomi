var _ = require('lodash'),
  async = require('async');

/**
 * Constructs a new MySQL collection.
 * @param {Database} db a MySQL database instance.
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

  if (db.isReady) {
    this._loadMeta();
  }
}

/**
 * Loads metadata from database.
 * @private
 */
Collection.prototype._loadMeta = function () {
  var meta = this.db._tables[this.table];

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
 * collectionInstance.hasColumn('name');
 */
Collection.prototype.hasColumn = function (column) {
  return this.columns.hasOwnProperty(column);
};

/**
 * Indicates whether the specified columns represent a primary key.
 * Primary keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after the database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * collectionInstance.isPrimaryKey('id');
 */
Collection.prototype.isPrimaryKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0);

  return _.xor(this.primaryKey, columns).length === 0;
};

/**
 * Indicates whether the specified columns represent a unique key.
 * Unique keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after the database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * collectionInstance.isUniqueKey('pid');
 */
Collection.prototype.isUniqueKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this.uniqueKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit when verdict is true
  });

  return verdict;
};

/**
 * Indicates whether the specified columns represent an index key.
 * Index keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after the database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * collectionInstance.isIndexKey('firstName', 'lastName');
 */
Collection.prototype.isIndexKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this.indexKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit when verdict is true
  });

  return verdict;
};

/**
 * Parses the given selector and returns a parameterized where clause.
 * @param {Boolean|Number|String|Date|Object|Array} selector the selector.
 * @returns {Object} with two properties: "sql" and "params".
 * @throws {Error} if selector is unspecified or invalid.
 * @private
 */
Collection.prototype._parseSelector = function (selector) {
  var self = this,
    sql = [],
    params = [],
    obj = {};

  if (_.isArray(selector)) { // array implies the use of "OR" comparator

    selector.forEach(function (e) {
      var result = self._parseSelector(e);

      sql.push(result.sql);
      params.push.apply(params, result.params);
    });

    return {sql: sql.join(' OR '), params: params};

  } else if (_.isNumber(selector) || _.isString(selector) || _.isDate(selector) || _.isBoolean(selector)) { // plain values imply primary key

    if (this.primaryKey.length === 1) { // primary key is simple
      obj[this.primaryKey[0]] = selector;
      return self._parseSelector(obj);

    } else { // primary key is compound or non existent
      throw new Error('Primary key is compound or non existent, thus Boolean, Number, String and Date selectors are useless');
    }

  } else if (_.isPlainObject(selector)) { // standard selector type

    _.forOwn(selector, function (v, k) {

      if (!self.hasColumn(k)) {
        throw new Error('Column "' + k + '" could not be found in table "' + self.table + '"');
      }

      if (v === null) {
        sql.push('`' + k + '` IS NULL');

      } else {
        sql.push('`' + k + '` = ?');
        params.push(v);
      }

    });

    return {sql: sql.join(' AND '), params: params};

  } else {
    throw new Error('Invalid type of selector: ' + typeof(selector));
  }
};

/**
 * Retrieves the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} [selector] a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.get = function (selector, callback) {
  var sql, params, result;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.get.bind(this, selector, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) {
    return callback(new Error('Table "' + this.table + '" cannot be found in database'));
  }

  // handle optional "selector" param
  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  // compile a parameterized SELECT statement
  sql = 'SELECT * FROM ??';
  params = [this.table];

  // append a WHERE clause if selector is specified
  if (selector) {

    try {
      result = this._parseSelector(selector);
    } catch (err) {
      return callback(err);
    }

    if (! _.isEmpty(result.sql)) {
      sql += ' WHERE ' + result.sql;
      params.push.apply(params, result.params);
    }

  }

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, callback);
};

/**
 * Counts the designated record(s) in database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} [selector] a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.count = function (selector, callback) {
  var sql, params, result;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.count.bind(this, selector, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) {
    return callback(new Error('Table "' + this.table + '" cannot be found in database'));
  }

  // handle optional "selector" param
  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  // compile a parameterized SELECT COUNT statement
  sql = 'SELECT COUNT(*) AS `count` FROM ??';
  params = [this.table];

  // append a WHERE clause if selector is specified
  if (selector) {

    try {
      result = this._parseSelector(selector);
    } catch (err) {
      return callback(err);
    }

    if (! _.isEmpty(result.sql)) {
      sql += ' WHERE ' + result.sql;
      params.push.apply(params, result.params);
    }
  }

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, function (error, records) {
    var count;

    if (error) return callback(error);
    count = records[0].count; // we need only the number

    callback(null, count);
  });
};

/**
 * Creates or updates the specified record in database.
 * @param {Object} properties the record's properties to be set in the database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.set = function (properties, callback) {
  var sql, params;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.set.bind(this, properties, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) {
    return callback(new Error('Table "' + this.table + '" cannot be found in database'));
  }

  // compile a parameterized INSERT [ON DUPLICATE KEY UPDATE] statement
  sql = 'INSERT INTO ?? SET ?';
  params = [this.table, properties];

  sql += ' ON DUPLICATE KEY UPDATE ' +
    _.without(Object.getOwnPropertyNames(properties), 'id')
    .map(function (k) {
      return '`' + k + '` = VALUES(`' + k + '`)';
    })
    .join(', ');

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, callback);
};

/**
 * Deletes the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} selector a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.del = function (selector, callback) {
  var sql, params, result;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.del.bind(this, selector, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) {
    return callback(new Error('Table "' + this.table + '" cannot be found in database'));
  }

  // compile a parameterized DELETE statement
  sql = 'DELETE FROM ??';
  params = [this.table];

  // append a WHERE clause
  try {
    result = this._parseSelector(selector);
  } catch (err) {
    return callback(err);
  }

  if (! _.isEmpty(result.sql)) {
    sql += ' WHERE ' + result.sql;
    params.push.apply(params, result.params);
  }

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, callback);
};

module.exports = Collection;
