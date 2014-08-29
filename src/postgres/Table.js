var Promise = require('bluebird'),
  _ = require('lodash'),
  GenericTable = require('../Table'),
  querybuilder = require('./querybuilder');

/**
 * Constructs a new Postgres Table.
 * @extends {GenericTable}
 * @constructor
 */
function PostgresTable () {
  GenericTable.apply(this, arguments);
}

// PostgresTable extends GenericTable
PostgresTable.prototype = Object.create(GenericTable.prototype);

/**
 * Retrieves the designated record(s) from this table.
 * @param {object} options query options.
 * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {(object|Array.<object>)} [options.order] an order expression to sort records.
 * @param {number} [options.limit] max number of records to return from table - must be a positive integer, i.e. limit > 0.
 * @param {number} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
 * @returns {Promise} resolving to an Array.<object> of records.
 */
PostgresTable.prototype._get = function (options) {
  var query;

  options.table = this._table;
  options.columns = Object.keys(this._columns);
  query = querybuilder.select(options);

  return this._db.query(query.sql, query.params);
};

/**
 * Counts the designated record(s) in this table.
 * @param {object} options query options.
 * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {number} [options.limit] max number of records to return from table - must be a positive integer, i.e. limit > 0.
 * @param {number} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
 * @returns {Promise} resolving to the count of records.
 */
PostgresTable.prototype._count = function (options) {
  var self = this, resolver, query;

  options.table = this._table;
  query = querybuilder.count(options);

  resolver = function (resolve, reject) {
    self._db.query(query.sql, query.params).then(function (records) {
      resolve(records[0].count | 0);
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

/**
 * Deletes the designated record(s) from this table.
 * @param {object} options query options.
 * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {(object|Array.<object>)} [options.order] an order expression to sort records.
 * @param {number} [options.limit] max number of records to delete from database - must be a positive integer, i.e. limit > 0.
 * @returns {Promise}
 */
PostgresTable.prototype._del = function (options) {
  var self = this, resolver, query;

  options.table = this._table;
  query = querybuilder.delete(options);

  resolver = function (resolve, reject) {
    self._db.query(query.sql, query.params).then(function () {
      resolve();
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

/**
 * Creates or updates (if already exists) the specified record(s) in this table.
 * @param {object} options query options.
 * @param {(object|Array.<object>)} options.values the record values.
 * @param {Array.<string>} options.columns the columns of the record(s) to insert.
 * @param {Array.<string>} options.updateColumns the columns of the record(s) to update.
 * @param {Array.<Array.<string>>} options.updateKeys the columns to check if record(s) already exists in table.
 * @returns {Promise} resolving to the updated/created records.
 */
PostgresTable.prototype._set = function (options) {
  var self = this, resolver, query;

  if (_.isArray(options.values)) {// postgres upsert can't handle multiple records - use async logic
    return Promise.map(options.values, function (obj) {
      options.values = obj;
      return self.set(options);
    }).all();
  }

  options.table = this._table;
  query = querybuilder.upsert(options);

  resolver = function (resolve, reject) {
    var t = new Transaction(self._db);
    t.begin().then(function () {
      return t.query('LOCK TABLE "' + self._table + '" IN SHARE ROW EXCLUSIVE MODE;');
    }).then(function () {
      return t.query(query.sql, query.params);
    }).then(function (records) {
      return t.commit().then(function () {
        resolve(records);
      });
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

/**
 * Creates the specified record(s) in this table.
 * @param {object} options query options.
 * @param {(object|Array.<object>)} options.values the record values.
 * @param {Array.<string>} options.columns the columns of the record(s) to insert.
 * @returns {Promise} resolving to the created records.
 */
PostgresTable.prototype._setNew = function (options) {
  var self = this, resolver, query;

  options.table = this._table;
  query = querybuilder.insert(options);

  resolver = function (resolve, reject) {
    self._db.query(query.sql, query.params).then(function (records) {
      resolve(records);
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

module.exports = PostgresTable;
