var util = require('util');
var Promise = require('bluebird');
var _ = require('lodash');
var GenericTable = require('../Table');
var querybuilder = require('./querybuilder');

/**
 * Constructs a new Postgres Table.
 * @extends {GenericTable}
 * @constructor
 */
function Table () {
  GenericTable.apply(this, arguments);
}

// @extends GenericTable
util.inherits(Table, GenericTable);

/**
 * Retrieves column meta-data from database.
 * @param {function} [callback] an optional callback function with (err, columns) arguments.
 * @returns {Promise} resolving to an array of column properties.
 * @private
 */
Table.prototype._getColumns = function (callback) {
  var sql;
  var params;

  sql = [
    'SELECT column_name, data_type, is_nullable, column_default, collation_name, ordinal_position',
    'FROM information_schema.columns',
    'WHERE table_catalog = $1',
    'AND table_schema NOT IN (\'pg_catalog\', \'information_schema\')',
    'AND table_name = $2;'
  ].join(' ');
  params = [this.db.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      return records.map(function (record) {
        return {
          name: record.column_name,
          type: record.data_type,
          isNullable: record.is_nullable === 'YES',
          default: record.column_default,
          collation: record.collation_name,
          comment: '', // TODO: extract comments
          position: record.ordinal_position - 1 // zero-indexed
        };
      });
    })
    .nodeify(callback);
};

/**
 * Retrieves foreign key meta-data from database.
 * @param {function} [callback] an optional callback function with (err, foreignKeys) arguments.
 * @returns {Promise}
 * @private
 */
Table.prototype._getForeignKeys = function (callback) {
  var sql;
  var params;

  sql = [
    'SELECT tc.constraint_name, tc.table_name, kcu.column_name,',
    'ccu.table_name AS referenced_table_name,',
    'ccu.column_name AS referenced_column_name',
    'FROM information_schema.table_constraints AS tc',
    'INNER JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name',
    'INNER JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name',
    'WHERE tc.constraint_type = \'FOREIGN KEY\'',
    'AND tc.constraint_catalog = $1',
    'AND (tc.table_name = $2 OR ccu.table_name = $2);'
  ].join(' ');
  params = [this.db.name, this.name];

  return this.db.query(sql, params, {})
    .then(function (records) {
      return records.map(function (record) {
        return {
          key: record.constraint_name,
          table: record.table_name,
          column: record.column_name,
          refTable: record.referenced_table_name,
          refColumn: record.referenced_column_name
        };
      });
    })
    .nodeify(callback);
};

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

  options.table = this.name;
  options.columns = Object.keys(this._columns);
  query = querybuilder.select(options);

  return this.db.query(query.sql, query.params);
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

  options.table = this.name;
  query = querybuilder.count(options);

  resolver = function (resolve, reject) {
    self.db.query(query.sql, query.params).then(function (records) {
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

  options.table = this.name;
  query = querybuilder.del(options);

  resolver = function (resolve, reject) {
    self.db.query(query.sql, query.params).then(function () {
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
    table: this.name,
    columns: columns,
    values: attrs,
    updateColumns: updateColumns,
    identifier: identifier,
    returnColumns: this._primaryKey
  });

  resolver = function (resolve, reject) {
    self.db.beginTransaction().then(function () {
      return this.query('LOCK TABLE "' + self.name + '" IN SHARE ROW EXCLUSIVE MODE;');
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
  var self = this;
  var query;
  var resolver;

  query = querybuilder.insert({
    table: this.name,
    columns: Object.keys(attrs),
    values: attrs,
    returnColumns: this._primaryKey
  });

  resolver = function (resolve, reject) {
    self.db.query(query.sql, query.params).then(function (records) {
      resolve(records[0]);
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

module.exports = Table;
