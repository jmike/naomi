var _ = require('lodash'),
  Promise = require('bluebird'),
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
 * @returns {promise} resolving to an Array.<object> of records.
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
 * @returns {promise} resolving to the count of records.
 */
Table.prototype._count = function (options) {
  var query;

  options.table = this._table;
  query = querybuilder.count(options);

  return this._db.query(query.sql, query.params).then(function (records) {
    return records[0].count || 0;
  });
};

/**
 * Deletes the designated record(s) from this table.
 * @param {object} options query options.
 * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {(object|Array.<object>)} [options.order] an order expression to sort records.
 * @param {number} [options.limit] max number of records to delete from database - must be a positive integer, i.e. limit > 0.
 * @returns {promise}
 */
Table.prototype._del = function (options) {
  var query;

  options.table = this._table;
  query = querybuilder.del(options);

  return this._db.query(query.sql, query.params).then(function () {
    return; // void
  });
};

/**
 * Creates or updates (if already exists) the specified record(s) in this table.
 * @param {(object|Array.<object>)} attrs the attributes of the record(s) to create/update.
 * @returns {promise} resolving to the primary key of the created/updated record(s).
 */
Table.prototype._set = function (attrs) {
  var self = this,
    columns,
    updateColumns,
    query;

  // check if attrs is array
  if (_.isArray(attrs)) {
    return Promise.all(
      attrs.map(function (e) {
        return self._set(e);
      })
    );
  }

  columns = Object.keys(attrs);
  updateColumns = _.difference(columns, this._primaryKey);

  query = querybuilder.upsert({
    table: this._table,
    columns: columns,
    values: attrs,
    updateColumns: updateColumns
  });

  return this._db.query(query.sql, query.params).then(function (result) {
    var obj = {};

    // check if primary key is simple + autoinc
    if (self._primaryKey.length === 1 && self._columns[self._primaryKey[0]].isAutoInc) {

      // check if record was inserted
      if (result.insertId) {
        obj[self._primaryKey[0]] = result.insertId;
        return obj;
      }

      // check if primary key is explicitely defined
      // if (_.has(options.attrs, self._primaryKey[0])) {
        return _.pick(attrs, self._primaryKey);
      // }

      // retrieve primary key from database
      // query = querybuilder.select({
      //   table: self._table,
      //   self._columns: self._primaryKey,
      //   selector: self._uniqueKeys.map(function (arr) {

      //   });
      //   limit: 1
      // });
      // return self._db.query(query.sql, query.params).then(function (records) {
      //   return records[0];
      // });
    }

    return _.pick(attrs, self._primaryKey);
  });
};

/**
 * Creates the specified record(s) in this table.
 * @param {(object|Array.<object>)} attrs the attributes of the record(s) to create.
 * @returns {promise} resolving to the primary key of the created record(s).
 */
Table.prototype._add = function (attrs) {
  var self = this,
    columns,
    query;

  // check if attrs is array
  if (_.isArray(attrs)) {

    return Promise.map(attrs, function (obj) {
      return self._add(obj);
    }).all();
  }

  columns = Object.keys(attrs);

  query = querybuilder.insert({
    table: this._table,
    columns: columns,
    values: attrs
  });

  return this._db.query(query.sql, query.params).then(function (result) {
    var obj = {};

    // check if primary key is simple + autoinc
    if (self._primaryKey.length === 1 && self._columns[self._primaryKey[0]].isAutoInc) {
      obj[self._primaryKey[0]] = result.insertId;
      return obj;
    }

    return _.pick(attrs, self._primaryKey);
  });
};

module.exports = Table;
