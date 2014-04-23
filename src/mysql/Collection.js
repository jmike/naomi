var _ = require('lodash');

/**
 * Constructs a new MySQL collection, i.e. a class representing the data of a table.
 * @param {Database} db a mysql database instance.
 * @param {String} table the name of the table on database.
 * @constructor
 */
function Collection(db, table) {
  var self = this;

  this.db = db;
  this.table = table;

  db.on('connected', function () {
    self._getIndexInfo(function (error, info) {
      if (error) throw error;

      self.primaryKey = info.primaryKey;
      self.uniqueKeys = info.uniqueKeys;
      self.indexKeys = info.indexKeys;
    });
  });
}

Collection.prototype._getIndexInfo = function (callback) {
  var sql, params;

  sql = 'SHOW INDEX FROM ??;';
  params = [this.table];

  this.db.query(sql, params, function (error, records) {
    var info = {
      primaryKey: [],
      uniqueKeys: {},
      indexKeys: {},
    };

    if (error) return callback(error);

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
 * @param {Boolean|Number|String|Date|Object|Array} selector a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.get = function (selector, callback) {
  var sql, params, result;

  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

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

  this.db.query(sql, params, callback);
};

/**
 * Counts the designated record(s) in database.
 * @param {Boolean|Number|String|Date|Object|Array} [selector] a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.count = function (selector, callback) {
  var sql, params, result;

  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

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

  this.db.query(sql, params, function (error, records) {
    var count;

    if (error) return callback(error);
    count = records[0].count;

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

  sql = 'INSERT INTO ?? SET ?';
  params = [this.table, properties];

  sql += ' ON DUPLICATE KEY UPDATE ' +
    _.without(Object.getOwnPropertyNames(properties), 'id')
    .map(function (k) {
      return '`' + k + '` = VALUES(`' + k + '`)';
    })
    .join(', ');

  sql += ';';

  this.db.query(sql, params, callback);
};

/**
 * Deletes the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array} selector a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.del = function (selector, callback) {
  var sql, params, result;

  sql = 'DELETE FROM ??';
  params = [this.table];

  result = this._parseSelector(selector);
  if (! _.isEmpty(result.sql)) {
    sql += ' WHERE ' + result.sql;
    params.push.apply(params, result.params);
  }

  sql += ';';

  this.db.query(sql, params, callback);
};

module.exports = Collection;
