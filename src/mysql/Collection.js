var _ = require('lodash'),
  async = require('async'),
  defaultCallback = require('../utils/defaultCallback');

/**
 * Constructs a new MySQL collection, i.e. a class representing the data of a table.
 * @param {Database} db mysql database instance.
 * @param {String} table the name of the table in db - should be an existing table.
 * @constructor
 */
function Collection(db, table) {
  var self = this,
    queue;

  this.db = db;
  this.table = table;
  this.isReady = false;

  queue = async.queue(function (task, callback) {
    task();
    callback();
  }, 1);
  queue.pause();

  this._queue = queue;

  if (db.isConnected) { // already connected
    this._bootstrap(defaultCallback);
  } else { // wait for the signal
    db.once('connect', function () {
      self._bootstrap(defaultCallback);
    });
  }
}

/**
 * Retrieves column meta-information from database.
 * @param {Function} callback a callback function i.e. function(err, columns).
 * @private
 */
Collection.prototype._getColumns = function (callback) {
  var self = this,
    sql, params;

  // compile parameterized SQL statement
  sql = 'SHOW FULL COLUMNS FROM ??;';
  params = [this.table];

  // query the db
  this.db.query(sql, params, function (err, records) {
    var columns = {};

    if (err) return callback(err);

    if (records.length === 0) {
      err = new Error('Table "' + self.table + '" cannot be found in database');
      return callback(err);
    }

    records.forEach(function (record, i) {
      columns[record.Field] = {
        type: record.Type,
        isNullable: record.Null === 'YES',
        default: record.Default,
        collation: record.Collation,
        comment: _.isEmpty(record.Comment) ? null : record.Comment,
        position: i
      };
    });

    callback(null, columns);
  });
};

/**
 * Retrieves indices meta-information from database, i.e. primary keys, unique keys and index keys.
 * @param {Function} callback a callback function i.e. function(err, indices).
 * @private
 */
Collection.prototype._getIndices = function (callback) {
  var sql, params;

  // compile a parameterized SQL statement
  sql = 'SHOW INDEX FROM ??;';
  params = [this.table];

  // run Forrest, run
  this.db.query(sql, params, function (err, records) {
    var indices = {
      primaryKey: [],
      uniqueKeys: {},
      indexKeys: {}
    };

    if (err) return callback(err);

    // parse records
    records.forEach(function (record) {
      var key, column, isUnique, stack;

      key = record.Key_name;
      column = record.Column_name;
      isUnique = record.Non_unique === 0;

      if (key === 'PRIMARY') {
        stack = indices.primaryKey;

      } else if (isUnique) {
        indices.uniqueKeys[key] = indices.uniqueKeys[key] || [];
        stack = indices.uniqueKeys[key];

      } else {
        indices.indexKeys[key] = indices.indexKeys[key] || [];
        stack = indices.indexKeys[key];
      }

      stack.push(column);
    });

    callback(null, indices);
  });
};

/**
 * Retrieves foreign keys information from database.
 * @param {Function} callback a callback function i.e. function(err, foreignKeys).
 * @private
 */
Collection.prototype._getForeignKeys = function (callback) {
  var self = this,
    schema = this.db.connectionProperties.database,
    sql, params;

  // compile a parameterized SQL statement
  sql = 'SELECT *' +
    ' FROM information_schema.KEY_COLUMN_USAGE' +
    ' WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME = ?' +
    ' OR TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_SCHEMA = ?;';
  params = [schema, schema, this.table, schema, this.table, schema];

  // run Forrest, run
  this.db.query(sql, params, function (err, records) {
    var foreignKeys = {};

    if (err) return callback(err);

    records.forEach(function (record) {
      var column = {},
        key, table;

      key = record.CONSTRAINT_NAME;

      if (record.TABLE_NAME === self.table) {
        table = record.REFERENCED_TABLE_NAME;
        column[record.COLUMN_NAME] = record.REFERENCED_COLUMN_NAME;
      } else {
        table = record.TABLE_NAME;
        column[record.REFERENCED_COLUMN_NAME] = record.COLUMN_NAME;
      }

      foreignKeys[key] = foreignKeys[key] || {
        referencedTable: table,
        associatedColumns: []
      };

      foreignKeys[key].associatedColumns.push(column);
    });

    callback(null, foreignKeys);
  });
};

/**
 * Bootstraps the collection, loading meta-data from database.
 * @param {Function} callback a callback function i.e. function(err).
 * @private
 */
Collection.prototype._bootstrap = function (callback) {
  var self = this;

  // #_bootstrap() runs only once in a collection lifetime
  if (this.isReady) return callback();

  async.series({

    columnInfo: function(callback) {
      self._getColumns(callback);
    },

    indexInfo: function(callback) {
      self._getIndices(callback);
    }

  }, function (err, result) {
    if (err) return callback(err);

    self.columns = result.columnInfo;
    self.primaryKey = result.indexInfo.primaryKey;
    self.uniqueKeys = result.indexInfo.uniqueKeys;
    self.indexKeys = result.indexInfo.indexKeys;

    self.isReady = true;
    self._queue.resume();

    callback();
  });
};

/**
 * Indicates whether the designated column exists in this table.
 * Please note: this method is meant to be called after collection is ready.
 * @param {String} column the name of the column.
 * @returns {Boolean}
 * @private
 */
Collection.prototype._existsColumn = function (column) {
  if (this.isReady) {
    return this.columns.hasOwnProperty(column);
  }

  return false;
};

/**
 * Indicates whether the designated column(s) represents a primary key.
 * Primary keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after collection is ready.
 * @param {...String} columns the name of the column(s).
 * @returns {Boolean}
 */
Collection.prototype._isPrimaryKey = function () {
  var verdict = false,
    args = Array.prototype.slice.call(arguments, 0);

  if (this.isReady) {
    verdict = this.primaryKey.length === args.length &&
      _.xor(this.primaryKey, args).length === 0;
  }

  return verdict;
};

/**
 * Indicates whether the designated column(s) represents a unique key.
 * Unique keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after collection is ready.
 * @param {...String} columns the name of the column(s).
 * @returns {Boolean}
 */
Collection.prototype._isUniqueKey = function () {
  var verdict = false,
    args = Array.prototype.slice.call(arguments, 0);

  if (this.isReady) {
    _.forOwn(this.uniqueKeys, function (v) {
      verdict = v.length === args.length &&
        _.xor(v, args).length === 0;

      return !verdict; // exit forOwn() if verdict is true
    });
  }

  return verdict;
};

/**
 * Indicates whether the designated column(s) represents an index key.
 * Index keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after collection is ready.
 * @param {...String} columns the name of the column(s).
 * @returns {Boolean}
 */
Collection.prototype._isIndexKey = function () {
  var verdict = false,
    args = Array.prototype.slice.call(arguments, 0);

  if (this.isReady) {
    _.forOwn(this.indexKeys, function (v) {
      verdict = v.length === args.length &&
        _.xor(v, args).length === 0;

      return !verdict; // exit forOwn() if verdict is true
    });
  }

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

  if (_.isArray(selector)) {
    selector.forEach(function (e) {
      var result = self._parseSelector(e);

      sql.push(result.sql);
      params.push.apply(params, result.params);
    });

    return {sql: sql.join(' OR '), params: params};

  } else if (_.isNumber(selector) || _.isString(selector) || _.isDate(selector) || _.isBoolean(selector)) {
    if (this.primaryKey.length === 1) { // primary key is simple
      obj[this.primaryKey[0]] = selector;
      return self._parseSelector(obj);

    } else { // primary key is compound
      throw new Error('Primary key is compound, thus Boolean, Number, String and Date selectors are useless');
    }

  } else if (_.isPlainObject(selector)) {

    _.forOwn(selector, function (v, k) {
      if (self._existsColumn(k)) {
        sql.push('`' + k + '` = ?');
        params.push(v);
      } else {
        throw new Error('Column "' + k + '" could not be found in table "' + self.table + '"');
      }
    });

    return {sql: sql.join(' AND '), params: params};

  } else {
    throw new Error('Invalid ' + typeof(selector) + ' selector');
  }
};

/**
 * Retrieves the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} [selector] a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.get = function (selector, callback) {
  var sql, params, result;

  // handle optional "selector" param
  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  // postpone if not ready
  if (!this.isReady) {
    this._queue.push(this.get.bind(this, selector, callback));
    return;
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

  // handle optional "selector" param
  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  // postpone if not ready
  if (!this.isReady) {
    this._queue.push(this.count.bind(this, selector, callback));
    return;
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
  if (!this.isReady) {
    this._queue.push(this.set.bind(this, properties, callback));
    return;
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
  if (!this.isReady) {
    this._queue.push(this.del.bind(this, selector, callback));
    return;
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
