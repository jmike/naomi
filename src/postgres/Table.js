var Promise = require('bluebird'),
  _ = require('lodash'),
  GenericTable = require('../Table'),
  querybuilder = require('./querybuilder');

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
Table.prototype._count = function (options) {
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
Table.prototype._del = function (options) {
  var self = this, resolver, query;

  options.table = this._table;
  query = querybuilder.del(options);

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
 * Extract keys to identify a record in table, based on the given columns.
 * @param {Array.<string>} columns
 * @return {Array.<Array.<string>>} [description]
 */
Table.prototype._extractIdentifier = function (columns) {
  var updateKeys = [], arr;

  // set primary key intersection
  arr = _.intersection(columns, this._primaryKey);

  if (arr.length === this._primaryKey.length) {
    updateKeys.push(arr);
  }

  // set unique keys intersection
  _.forOwn(this._uniqueKeys, function (uniqueKey) {
    arr = _.intersection(columns, uniqueKey);

    if (arr.length === uniqueKey.length) {
      updateKeys.push(arr);
    }
  });

  return updateKeys;
};

/**
 * Creates or updates (if already exists) the specified record(s) in this table.
 * @param {(object|Array<object>)} attrs the attributes of the record(s) to create/update.
 * @returns {Promise} resolving to the primary key of the created/updated record(s).
 */
Table.prototype._set = function (attrs) {
  var self = this,
    columns,
    updateColumns,
    identifier,
    query,
    resolver;

  if (_.isArray(attrs)) {

    return Promise.map(attrs, function (obj) {
      return self._set(obj);
    }).all();
  }

  columns = Object.keys(attrs);
  updateColumns = _.difference(columns, this._primaryKey);
  identifier = this._extractIdentifier(columns);

  query = querybuilder.upsert({
    table: this._table,
    columns: columns,
    values: attrs,
    updateColumns: updateColumns,
    identifier: identifier,
    returnColumns: this._primaryKey
  });

  resolver = function (resolve, reject) {
    self._db.beginTransaction().then(function () {
      return this.query('LOCK TABLE "' + self._table + '" IN SHARE ROW EXCLUSIVE MODE;');
    }).then(function () {
      return this.query(query.sql, query.params);
    }).then(function (records) {
      return this.commit().then(function () {
        resolve(records[0]);
      });
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

/**
 * Creates the specified record(s) in this table.
 * @param {(object|Array.<object>)} attrs the attributes of the record(s) to create.
 * @returns {Promise} resolving to the primary key of the created record(s).
 */
Table.prototype._add = function (attrs) {
  var self = this, query, resolver;

  query = querybuilder.insert({
    table: this._table,
    columns: Object.keys(attrs),
    values: attrs,
    returnColumns: this._primaryKey
  });

  resolver = function (resolve, reject) {
    self._db.query(query.sql, query.params).then(function (records) {
      resolve(records[0]);
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

module.exports = Table;
