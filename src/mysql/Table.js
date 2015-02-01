var util = require('util');
var _ = require('lodash');
var GenericTable = require('../Table');
var queryparser = require('../query/parser');
var QueryBuilder = require('./QueryBuilder');

/**
 * Constructs a new Postgres Table.
 * @extends {GenericTable}
 * @constructor
 */
function Table () {
  GenericTable.apply(this, arguments);
  this.querybuilder = new QueryBuilder(this);
}

// @extends GenericTable
util.inherits(Table, GenericTable);

/**
 * @extends GenericTable#_getColumns
 */
Table.prototype._getColumns = function (callback) {
  var re = /auto_increment/i;
  var sql;
  var params;

  sql = [
    'SELECT `COLUMN_NAME`, `DATA_TYPE`, `IS_NULLABLE`, `EXTRA`, `COLUMN_DEFAULT`,',
    '`COLLATION_NAME`, `COLUMN_COMMENT`, `ORDINAL_POSITION`',
    'FROM information_schema.COLUMNS',
    'WHERE `TABLE_SCHEMA` = ?',
    'AND `TABLE_NAME` = ?',
    'ORDER BY `ORDINAL_POSITION` ASC;'
  ].join(' ');
  params = [this.db.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      return records.map(function (record) {
        return {
          name: record.COLUMN_NAME,
          type: record.DATA_TYPE,
          isNullable: record.IS_NULLABLE === 'YES',
          isAutoInc: re.test(record.EXTRA),
          default: record.COLUMN_DEFAULT,
          collation: record.COLLATION_NAME,
          comment: (record.COLUMN_COMMENT === '') ? null : record.COLUMN_COMMENT
        };
      });
    })
    .nodeify(callback);
};

/**
 * @extends GenericTable#_getPrimaryKey
 */
Table.prototype._getPrimaryKey = function (callback) {
  var sql;
  var params;

  sql = [
    'SELECT `COLUMN_NAME`',
    'FROM information_schema.STATISTICS',
    'WHERE `TABLE_SCHEMA` = ?',
    'AND `TABLE_NAME` = ?',
    'AND `INDEX_NAME` = \'PRIMARY\'',
    'ORDER BY `SEQ_IN_INDEX` ASC;'
  ].join(' ');
  params = [this.db.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      return records.map(function (record) {
        return record.COLUMN_NAME;
      });
    })
    .nodeify(callback);
};

/**
 * @extends GenericTable#_getUniqueKeys
 */
Table.prototype._getUniqueKeys = function (callback) {
  var sql;
  var params;

  sql = [
    'SELECT `INDEX_NAME`, `COLUMN_NAME`',
    'FROM information_schema.STATISTICS',
    'WHERE `TABLE_SCHEMA` = ?',
    'AND `TABLE_NAME` = ?',
    'AND `INDEX_NAME` != \'PRIMARY\'',
    'AND `NON_UNIQUE` = 0',
    'ORDER BY `SEQ_IN_INDEX` ASC;'
  ].join(' ');
  params = [this.db.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      var uniqueKeys = {};

      records.forEach(function (record) {
        uniqueKeys[record.INDEX_NAME] = uniqueKeys[record.INDEX_NAME] || [];
        uniqueKeys[record.INDEX_NAME].push(record.COLUMN_NAME);
      });

      return uniqueKeys;
    })
    .nodeify(callback);
};

/**
 * @extends GenericTable#_getIndexKeys
 */
Table.prototype._getIndexKeys = function (callback) {
  var sql;
  var params;

  sql = [
    'SELECT `INDEX_NAME`, `COLUMN_NAME`',
    'FROM information_schema.STATISTICS',
    'WHERE `TABLE_SCHEMA` = ?',
    'AND `TABLE_NAME` = ?',
    'AND `INDEX_NAME` != \'PRIMARY\'',
    'AND `NON_UNIQUE` = 1',
    'ORDER BY `SEQ_IN_INDEX` ASC;'
  ].join(' ');
  params = [this.db.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      var indexKeys = {};

      records.forEach(function (record) {
        indexKeys[record.INDEX_NAME] = indexKeys[record.INDEX_NAME] || [];
        indexKeys[record.INDEX_NAME].push(record.COLUMN_NAME);
      });

      return indexKeys;
    })
    .nodeify(callback);
};

/**
 * @extends GenericTable#_getForeignKeys
 */
Table.prototype._getForeignKeys = function (callback) {
  var sql;
  var params;

  sql = [
    'SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME',
    'FROM information_schema.KEY_COLUMN_USAGE',
    'WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_SCHEMA = ?',
    'AND (TABLE_NAME = ? OR REFERENCED_TABLE_NAME = ?);'
  ].join(' ');
  params = [this.db.name, this.db.name, this.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      return records.map(function (record) {
        return {
          key: record.CONSTRAINT_NAME,
          table: record.TABLE_NAME,
          column: record.COLUMN_NAME,
          refTable: record.REFERENCED_TABLE_NAME,
          refColumn: record.REFERENCED_COLUMN_NAME
        };
      });
    })
    .nodeify(callback);
};

/**
 * @extends GenericTable#get()
 */
Table.prototype.get = function (query, callback) {
  var $query = queryparser.parse(query);
  var obj = this.querybuilder.select($query);

  return this.db.query(obj.sql, obj.params)
    .nodeify(callback);
};

/**
 * @extends GenericTable#count()
 */
Table.prototype.count = function (query, callback) {
  var $query = queryparser.parse(query);
  var obj = this.querybuilder.count($query);

  return this.db.query(obj.sql, obj.params)
    .then(function (records) {
      return records[0].count || 0;
    })
    .nodeify(callback);
};

/**
 * @extends GenericTable#del()
 */
Table.prototype.del = function (query, callback) {
  var $query = queryparser.parse(query);
  var obj = this.querybuilder.count($query);

  return this.db.query(obj.sql, obj.params)
    .return() // void
    .nodeify(callback);
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
  updateColumns = _.difference(columns, this.primaryKey);

  // compile upsert query
  query = querybuilder.upsert({
    table: this.name,
    columns: columns,
    values: attrs,
    updateColumns: updateColumns
  });

  // run query
  return this.db.query(query.sql, query.params)
    .then(function (result) {
      var primaryKey, isSimpleAutoInc, insertedRows, funct;

      primaryKey = self.primaryKey; // note: primaryKey is array
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
    table: this.name,
    columns: columns,
    values: attrs
  });

  // run query
  return this.db.query(query.sql, query.params)
    .then(function (result) {
      var primaryKey, isSimpleAutoInc, funct;

      primaryKey = self.primaryKey; // note: primaryKey is array
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
