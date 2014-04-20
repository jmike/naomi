var _ = require('lodash');

/**
 * Constructs a new MySQL model, i.e. a class representing a table.
 * @param {Database} db a mysql database instance.
 * @param {String} table the name of the table on database.
 * @constructor
 */
function Model(db, table) {
  this.db = db;
  this.table = table;
}

/**
 * Parses the given selector and returns a parameterized where clause.
 * @param {Boolean|Number|String|Date|Object|Array} selector the selector.
 * @returns {Object} with two properties: "sql" and "params".
 * @private
 */
Model.prototype._parseSelector = function (selector) {
  var self = this, sql, params;

  if (_.isArray(selector)) {
    sql = []; params = [];

    selector.forEach(function (e) {
      var result = self._parseSelector(e);

      sql.push(result.sql);
      params.push.apply(params, result.params);
    });

    return {sql: sql.join(' OR '), params: params};

  } else if (_.isPlainObject(selector)) {
    sql = []; params = [];

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
Model.prototype.get = function (selector, callback) {
  var sql, params, result;

  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  sql = 'SELECT * FROM `' + this.table + '`';
  params = [];

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
Model.prototype.count = function (selector, callback) {
  var sql, params, result;

  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  sql = 'SELECT COUNT(*) AS `count` FROM `' + this.table + '`';
  params = [];

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
 * Creates or updates the specified record in database.
 * @param {Object} properties the record's properties to be set in the database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Model.prototype.set = function (properties, callback) {
  var sql, params;

  sql = 'INSERT INTO `' + this.table + '` SET ?';
  params = [properties];

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
Model.prototype.del = function (selector, callback) {
  var sql, params, result;

  sql = 'DELETE FROM `' + this.table + '`';
  params = [];

  result = this._parseSelector(selector);
  if (! _.isEmpty(result.sql)) {
    sql += ' WHERE ' + result.sql;
    params.push.apply(params, result.params);
  }

  sql += ';';

  this.db.query(sql, params, callback);
};

module.exports = Model;
