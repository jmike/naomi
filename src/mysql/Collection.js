var _ = require('lodash'),
  async = require('async');

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

  this.queue = queue;

  if (db.isConnected) { // already connected
    this._loadMetaData(function (err) {
      if (err) throw err;

      self.isReady = true;
      queue.resume();
    });
  } else { // wait for the signal
    db.once('connect', function () {
      self._loadMetaData(function (err) {
        if (err) throw err;

        self.isReady = true;
        queue.resume();
      });
    });
  }
}

/**
 * Retrieves generic meta-information about this table.
 * @param {Function} callback a callback function i.e. function(err, info).
 * @private
 */
Collection.prototype._getTableInfo = function (callback) {
  var sql, params;

  // compile parameterized SQL statement
  sql = 'SELECT * FROM information_schema.TABLES' +
    ' WHERE `TABLE_NAME` = ? AND `TABLE_SCHEMA` = ?;';

  params = [this.table, this.db.connectionProperties.database];

  // run Forrest, run
  this.db.query(sql, params, function (err, records) {
    if (err) return callback(err);

    callback(null, records[0]);
  });
};

/**
 * Retrieves index meta-information about this table.
 * @param {Function} callback a callback function i.e. function(err, info).
 * @private
 */
Collection.prototype._getIndexInfo = function (callback) {
  var sql, params;

  // compile a parameterized SQL statement
  sql = 'SHOW INDEX FROM ??;';
  params = [this.table];

  // run Forrest, run
  this.db.query(sql, params, function (err, records) {
    var info = {
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
 * Loads meta-data from database.
 * @param {Function} callback a callback function i.e. function(err).
 * @private
 */
Collection.prototype._loadMetaData = function (callback) {
  var self = this;

  async.series({

    tableInfo: function(callback) {
      self._getTableInfo(function (err, info) {

        if (err) return callback(err);

        if (info === undefined) {
          return callback(
            new Error('Table "' + self.table + '" cannot be found in database')
          );
        }

        callback(null, info);
      });
    },

    indexInfo: function(callback) {
      self._getIndexInfo(callback);
    }

  }, function (err, result) {
    if (err) return callback(err);

    self.primaryKey = result.indexInfo.primaryKey;
    self.uniqueKeys = result.indexInfo.uniqueKeys;
    self.indexKeys = result.indexInfo.indexKeys;

    callback();
  });
};

/**
 * Parses the given selector and returns a parameterized where clause.
 * @param {Boolean|Number|String|Date|Object|Array} selector the selector.
 * @returns {Object} with two properties: "sql" and "params".
 * @private
 */
Collection.prototype._parseSelector = function (selector) {
  var self = this, sql, params;

  if (_.isArray(selector)) {
    sql = [];
    params = [];

    selector.forEach(function (e) {
      var result = self._parseSelector(e);

      sql.push(result.sql);
      params.push.apply(params, result.params);
    });

    return {sql: sql.join(' OR '), params: params};

  } else if (_.isPlainObject(selector)) {
    sql = [];
    params = [];

    _.forOwn(selector, function (v, k) {
      sql.push('`' + k + '` = ?');
      params.push(v);
    });

    return {sql: sql.join(' AND '), params: params};

  } else { // boolean, number, string, date
    sql = '`id` = ?';
    params = [selector];

    return {sql: sql, params: params};
  }
};

/**
 * Retrieves the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array} [selector] a selector to match the record(s) in database.
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
    this.queue.push(this.get.bind(this, selector, callback));
    return;
  }

  // compile a parameterized SELECT statement
  sql = 'SELECT * FROM ??';
  params = [this.table];

  if (selector) {
    result = this._parseSelector(selector);

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
 * @param {Boolean|Number|String|Date|Object|Array} [selector] a selector to match the record(s) in database.
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
    this.queue.push(this.count.bind(this, selector, callback));
    return;
  }

  // compile a parameterized SELECT COUNT statement
  sql = 'SELECT COUNT(*) AS `count` FROM ??';
  params = [this.table];

  if (selector) {
    result = this._parseSelector(selector);

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
    this.queue.push(this.set.bind(this, properties, callback));
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
 * @param {Boolean|Number|String|Date|Object|Array} selector a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.del = function (selector, callback) {
  var sql, params, result;

  // postpone if not ready
  if (!this.isReady) {
    this.queue.push(this.del.bind(this, selector, callback));
    return;
  }

  // compile a parameterized DELETE statement
  sql = 'DELETE FROM ??';
  params = [this.table];

  result = this._parseSelector(selector);
  if (! _.isEmpty(result.sql)) {
    sql += ' WHERE ' + result.sql;
    params.push.apply(params, result.params);
  }

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, callback);
};

module.exports = Collection;
