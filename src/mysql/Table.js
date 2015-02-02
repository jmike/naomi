var util = require('util');
var _ = require('lodash');
var type = require('type-of');
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
  // parse query
  var $query = queryparser.parse(query);

  // build parameterized SQL statement
  var stmt = this.querybuilder.select($query);

  // run statement
  return this.db.query(stmt.sql, stmt.params)
    .nodeify(callback);
};

/**
 * @extends GenericTable#count()
 */
Table.prototype.count = function (query, callback) {
  // parse query
  var $query = queryparser.parse(query);

  // build parameterized SQL statement
  var stmt = this.querybuilder.count($query);

  // run statement
  return this.db.query(stmt.sql, stmt.params)
    // return just the number
    .then(function (records) {
      return records[0].count || 0;
    })
    .nodeify(callback);
};

/**
 * @extends GenericTable#del()
 */
Table.prototype.del = function (query, callback) {
  // parse query
  var $query = queryparser.parse(query);

  // build parameterized SQL statement
  var stmt = this.querybuilder.count($query);

  // run statement
  return this.db.query(stmt.sql, stmt.params)
    .return() // void
    .nodeify(callback);
};

/**
 * @extends GenericTable#set()
 */
Table.prototype.set = function (attrs, options, callback) {
  var _this = this;
  var $query;
  var stmt;

  // validate attrs argument
  if (!_.isArray(attrs) && !_.isObject(attrs)) {
    throw new Error('Invalid attrs argument; expected array or object, received ' + type(attrs));
  }

  // handle optional options argument
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  } else if (_.isUndefined(options)) {
    options = {};
  }

  // validate options argument
  if (!_.isPlainObject(options)) {
    throw new Error('Invalid options argument; expected object, received ' + type(options));
  }

  // parse query
  $query = queryparser.parse({$values: attrs});

  // build parameterized SQL statement
  stmt = this.querybuilder.upsert($query);

  // run statement
  return this.db.query(stmt.sql, stmt.params)
    .then(function (result) {
      var hasAutoIncPrimaryKey = _this.hasAutoIncPrimaryKey();
      var insertedRows = 0;

      return $query.$attrs.map(function (e) {
        var obj = {};

        // check if element contains primary key
        var containsPrimaryKey = _this.primaryKey.every(function (k) {
          return e.hasOwnProperty(k);
        });

        if (containsPrimaryKey) return _.pick(obj, _this.primaryKey);

        if (hasAutoIncPrimaryKey) {
          obj[_this.primaryKey[0]] = result.insertId + insertedRows;
          insertedRows++;
          return obj;
        }

        return {};
      });
    })
    .then(function (records) {
      if (_.isPlainObject(attrs)) return records[0];
      return records;
    })
    .nodeify(callback);
};

/**
 * @extends GenericTable#add()
 */
Table.prototype.add = function (attrs, options, callback) {
  var _this = this;
  var $query;
  var stmt;

  // validate attrs argument
  if (!_.isArray(attrs) && !_.isObject(attrs)) {
    throw new Error('Invalid attrs argument; expected array or object, received ' + type(attrs));
  }

  // handle optional options argument
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  } else if (_.isUndefined(options)) {
    options = {};
  }

  // validate options argument
  if (!_.isPlainObject(options)) {
    throw new Error('Invalid options argument; expected object, received ' + type(options));
  }

  // parse attrs + options
  $query = queryparser.parse({$values: attrs});
  $query = _.extend($query, options);

  // build parameterized SQL statement
  stmt = this.querybuilder.insert($query);

  // run statement
  return this.db.query(stmt.sql, stmt.params)
    .then(function (result) {
      var hasAutoIncPrimaryKey = _this.hasAutoIncPrimaryKey();

      return $query.$attrs.map(function (e, i) {
        var obj = {};

        if (hasAutoIncPrimaryKey) {
          obj[_this.primaryKey[0]] = result.insertId + i;
          return obj;
        }

        return _.pick(obj, _this.primaryKey);
      });
    })
    .then(function (records) {
      if (_.isPlainObject(attrs)) return records[0];
      return records;
    })
    .nodeify(callback);
};

module.exports = Table;
