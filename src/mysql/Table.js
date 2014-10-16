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
    columns, updateColumns, query;

  // extract columns from attrs
  columns = _.isArray(attrs) ? Object.keys(attrs[0]) : Object.keys(attrs);

  // calculate updateColumns
  updateColumns = _.difference(columns, this._primaryKey);

  // compile upsert query
  query = querybuilder.upsert({
    table: this._table,
    columns: columns,
    values: attrs,
    updateColumns: updateColumns
  });

  // run query
  return this._db.query(query.sql, query.params)
    .then(function (result) {
      var primaryKey, isSimpleAutoInc, insertedRows, funct;

      primaryKey = self._primaryKey; // note: primaryKey is array
      isSimpleAutoInc = primaryKey.length === 1 && self.isAutoInc(primaryKey[0]);
      insertedRows = 0;

      funct = function (obj) {
        var hasPrimaryKey = primaryKey.every(function (k) {
          return obj.hasOwnProperty(k);
        });

        if (hasPrimaryKey) return _.pick(obj, primaryKey);
        if (isSimpleAutoInc) return _.zipObject(primaryKey, [result.insertId + insertedRows++]);

        return {}; // TODO: query db for identifiers
      };

      if (_.isArray(attrs)) return attrs.map(funct);
      return funct(attrs);
    });
};

/**
 * Creates the specified record(s) in this table.
 * @param {(object|Array.<object>)} attrs the attributes of the record(s) to create.
 * @returns {promise} resolving to the primary key of the created record(s).
 */
Table.prototype._add = function (attrs) {
  var self = this,
    columns, query;

  // extract columns from attrs
  columns = _.isArray(attrs) ? Object.keys(attrs[0]) : Object.keys(attrs);

  // compile query
  query = querybuilder.insert({
    table: this._table,
    columns: columns,
    values: attrs
  });

  // run query
  return this._db.query(query.sql, query.params)
    .then(function (result) {
      var primaryKey, isSimpleAutoInc, funct;

      primaryKey = self._primaryKey; // note: primaryKey is array
      isSimpleAutoInc = primaryKey.length === 1 && self.isAutoInc(primaryKey[0]);

      funct = function (obj, i) {
        if (isSimpleAutoInc) return _.zipObject(primaryKey, [result.insertId + i]);
        return _.pick(obj, primaryKey);
      };

      if (_.isArray(attrs)) return attrs.map(funct);
      return funct(attrs, 0);
    });
};

module.exports = Table;
