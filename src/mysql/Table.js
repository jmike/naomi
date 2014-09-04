var _ = require('lodash'),
  Promise = require('bluebird'),
  GenericTable = require('../Table'),
  select = require('./utils/select'),
  count = require('./utils/count'),
  del = require('./utils/delete'),
  upsert = require('./utils/upsert'),
  insert = require('./utils/insert');

/**
 * Constructs a new Postgres Table.
 * @extends {GenericTable}
 * @constructor
 */
function Table () {
  GenericTable.apply(this, arguments);
}

// Table extends GenericTable
Table.prototype = Object.create(GenericTable.prototype);

/**
 * Retrieves the designated record(s) from this table.
 * @param {object} options query options.
 * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {(object|Array.<object>)} [options.order] an order expression to sort records.
 * @param {number} [options.limit] max number of records to return from table - must be a positive integer, i.e. limit > 0.
 * @param {number} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
 * @returns {Promise} resolving to an Array.<object> of records.
 */
Table.prototype._get = function (options) {
  var query;

  options.table = this._table;
  options.columns = Object.keys(this._columns);
  query = select(options);

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
Table.prototype._count = function (options) {
  var self = this, resolver, query;

  options.table = this._table;
  query = count(options);

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
Table.prototype._del = function (options) {
  var self = this, resolver, query;

  options.table = this._table;
  query = del(options);

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
Table.prototype._set = function (options) {
  return Promise.resolve(options);
};

/**
 * Creates the specified record(s) in this table.
 * @param {object} options query options.
 * @param {(object|Array.<object>)} options.values the record values.
 * @param {Array.<string>} options.columns the columns of the record(s) to insert.
 * @returns {Promise} resolving to the created records.
 */
Table.prototype._setNew = function (options) {
  return Promise.resolve(options);
};

module.exports = Table;
