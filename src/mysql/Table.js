var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var type = require('type-of');
var Promise = require('bluebird');
var querybuilder = require('./query');

/**
 * Constructs a new Table instance.
 * @param {Database} db the database of the table.
 * @param {String} name the name of the table.
 * @constructor
 */
function Table (db, name) {
  this.db = db;
  this.name = name;
  this.columns = [];
  this.primaryKey = [];
  this.uniqueKeys = {};
  this.indexKeys = {};
  // this.foreignKeys = {};
  this.isReady = false;

  // init the EventEmitter
  EventEmitter.call(this);
  this.setMaxListeners(99);
}

// @extends EventEmitter
util.inherits(Table, EventEmitter);

/**
 * Enqueues the given resolver function until the Table is ready.
 * Executes the resolver immediately after connection.
 * @param {function} resolver
 * @return {Promise}
 * @private
 */
Table.prototype._enqueue = function (resolver) {
  var _this = this;

  return new Promise(function(resolve, reject) {
    if (_this.isReady) {
      resolver(resolve, reject);
    } else {
      // wait for table to load metadata
      _this.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  });
};

/**
 * Retrieves column metadata from database.
 * @param {Function} [callback] an optional callback function with (err, columns) arguments.
 * @returns {Promise} resolving to Array.<object>
 */
Table.prototype.getColumns = function (callback) {
  var re = /auto_increment/i;

  var sql = [
    'SELECT `COLUMN_NAME`, `DATA_TYPE`, `IS_NULLABLE`, `EXTRA`, `COLUMN_DEFAULT`,',
    '`COLLATION_NAME`, `COLUMN_COMMENT`, `ORDINAL_POSITION`',
    'FROM information_schema.COLUMNS',
    'WHERE `TABLE_SCHEMA` = ?',
    'AND `TABLE_NAME` = ?',
    'ORDER BY `ORDINAL_POSITION` ASC;'
  ].join(' ');

  var params = [this.db.name, this.name];

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
 * Retrieves primary key metadata from database.
 * @param {Function} [callback] an optional callback function with (err, primaryKey) arguments.
 * @returns {Promise} resolving to Array.<string>
 * @private
 */
Table.prototype.getPrimaryKey = function (callback) {
  var sql = [
    'SELECT `COLUMN_NAME`',
    'FROM information_schema.STATISTICS',
    'WHERE `TABLE_SCHEMA` = ?',
    'AND `TABLE_NAME` = ?',
    'AND `INDEX_NAME` = \'PRIMARY\'',
    'ORDER BY `SEQ_IN_INDEX` ASC;'
  ].join(' ');

  var params = [this.db.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      return records.map(function (record) {
        return record.COLUMN_NAME;
      });
    })
    .nodeify(callback);
};

/**
 * Retrieves unique key metadata from database.
 * @param {Function} [callback] an optional callback function with (err, uniqueKeys) arguments.
 * @returns {Promise} resolving to object
 */
Table.prototype.getUniqueKeys = function (callback) {
  var sql = [
    'SELECT `INDEX_NAME`, `COLUMN_NAME`',
    'FROM information_schema.STATISTICS',
    'WHERE `TABLE_SCHEMA` = ?',
    'AND `TABLE_NAME` = ?',
    'AND `INDEX_NAME` != \'PRIMARY\'',
    'AND `NON_UNIQUE` = 0',
    'ORDER BY `SEQ_IN_INDEX` ASC;'
  ].join(' ');

  var params = [this.db.name, this.name];

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
 * Retrieves index key metadata from database.
 * @param {Function} [callback] an optional callback function with (err, indexKeys) arguments.
 * @returns {Promise} resolving to object
 */
Table.prototype.getIndexKeys = function (callback) {
  var sql = [
    'SELECT `INDEX_NAME`, `COLUMN_NAME`',
    'FROM information_schema.STATISTICS',
    'WHERE `TABLE_SCHEMA` = ?',
    'AND `TABLE_NAME` = ?',
    'AND `INDEX_NAME` != \'PRIMARY\'',
    'AND `NON_UNIQUE` = 1',
    'ORDER BY `SEQ_IN_INDEX` ASC;'
  ].join(' ');

  var params = [this.db.name, this.name];

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
 * Retrieves foreign key metadata from database.
 * @param {Function} [callback] an optional callback function with (err, foreignKeys) arguments.
 * @returns {Promise} resolving to object
 * @private
 */
Table.prototype._getForeignKeys = function (callback) {
  var sql = [
    'SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME',
    'FROM information_schema.KEY_COLUMN_USAGE',
    'WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_SCHEMA = ?',
    'AND (TABLE_NAME = ? OR REFERENCED_TABLE_NAME = ?);'
  ].join(' ');

  var params = [this.db.name, this.db.name, this.name, this.name];

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
 * Loads table metadata from database.
 * @param {function} [callback] an optional callback function with (err, foreignKeys) arguments.
 * @returns {Promise}
 * @emits Table#ready
 * @emits Table#error
 */
Table.prototype.loadMeta = function (callback) {
  var _this = this;

  this.db.hasTable(this.name)
    .then(function (hasTable) {
      // make sure table exists
      if (!hasTable) {
        _this.emit('error', new Error('Table "' + _this.name + '" does not exist in database'));
        return; // exit
      }

      // retrieve metadata
      return Promise.props({
        columns: _this.getColumns(),
        primaryKey: _this.getPrimaryKey(),
        uniqueKeys: _this.getUniqueKeys(),
        indexKeys: _this.getIndexKeys(),
        // foreignKeys: _this._getForeignKeys()
      })
        // update table properties
        .then(function(results) {
          _this.columns = results.columns;
          _this.primaryKey = results.primaryKey;
          _this.uniqueKeys = results.uniqueKeys;
          _this.indexKeys = results.indexKeys;
          _this.foreignKeys = results.foreignKeys;
          _this.isReady = true;
          _this.emit('ready');
        });
    })
    .nodeify(callback);
};

/**
 * Indicates whether the specified column exists in table.
 * This method will always return false until database is ready.
 * @param {string} name the name of the column.
 * @returns {boolean}
 * @example
 *
 * table.hasColumn('id');
 */
Table.prototype.hasColumn = function (name) {
  return this.columns.some(function (column) {
    return column.name === name;
  });
};

/**
 * Indicates whether the specified column(s) represent a primary key.
 * Primary keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params in this function.
 * This method will always return false until database is ready.
 * @param {...string} columns the name of the columns.
 * @returns {boolean}
 * @example
 *
 * table.isPrimaryKey('id');
 */
Table.prototype.isPrimaryKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0);
  return _.xor(this.primaryKey, columns).length === 0;
};

/**
 * Indicates whether the specified column(s) represent a unique key.
 * Unique keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * This method will always return false until database is ready.
 * @param {...string} columns the name of the columns.
 * @returns {boolean}
 * @example
 *
 * table.isUniqueKey('pid');
 */
Table.prototype.isUniqueKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0);
  return _.some(this.uniqueKeys, function (e) {
    return _.xor(e, columns).length === 0;
  });
};

/**
 * Indicates whether the specified column(s) represent an index key.
 * Index keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * This method will always return false until database is ready.
 * @param {...string} columns the name of the columns.
 * @returns {boolean}
 * @example
 *
 * table.isIndexKey('firstName', 'lastName');
 */
Table.prototype.isIndexKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0);
  return _.some(this.indexKeys, function (e) {
    return _.xor(e, columns).length === 0;
  });
};

/**
 * Indicates whether the specified column is automatically incremented.
 * This method will always return false until database is ready.
 * @param {string} columnName the name of the column.
 * @returns {boolean}
 * @example
 *
 * table.isAutoInc('id');
 */
Table.prototype.isAutoInc = function (columnName) {
  return this.columns.some(function (column) {
    return column.isAutoInc && column.name === columnName;
  });
};

/**
 * Indicates whether the table has a simple automatically incremented primary key.
 * This method will always return false until database is ready.
 * @returns {boolean}
 * @example
 *
 * table.hasAutoIncPrimaryKey();
 */
Table.prototype.hasAutoIncPrimaryKey = function () {
  return this.primaryKey.length === 1 && this.isAutoInc(this.primaryKey[0]);
};

/**
 * Retrieves the designated record(s) from the table.
 * @param {(Boolean|Number|String|Date|Object|Array.<Object>)} [$query] a mongo-like query object.
 * @param {Function} [callback] an optional callback function with (err, records) arguments.
 * @returns {Promise} resolving to an Array of records
 */
Table.prototype.get = function ($query, callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve, reject) {
    // build parameterized SQL statement
    var stmt = querybuilder.select($query, _this);
    // run statement
    return _this.db.query(stmt.sql, stmt.params)
      .then(resolve, reject);
  };

  return this._enqueue(resolver).nodeify(callback);
};

/**
 * Counts the designated record(s) in this table.
 * @param {(Boolean|Number|String|Date|Object|Array.<Object>)} [$query] a query object.
 * @param {Function} [callback] an optional callback function with (err, count) arguments.
 * @returns {Promise} resolving to the count of records
 */
Table.prototype.count = function ($query, callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve, reject) {
    // build parameterized SQL statement
    var stmt = querybuilder.count($query, _this);
    // run statement
    return _this.db.query(stmt.sql, stmt.params)
      .then(resolve, reject);
  };

  return this._enqueue(resolver)
    // return only the number
    .then(function (records) {
      return records[0].count || 0;
    })
    .nodeify(callback);
};

/**
 * Deletes the designated record(s) from this table.
 * @param {(Boolean|Number|String|Date|Object|Array.<Object>)} [$query] a query object.
 * @param {Function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 */
Table.prototype.del = function ($query, callback) {
  var _this = this;
  var resolver;

  // define promise resolver
  resolver = function (resolve, reject) {
    // build parameterized SQL statement
    var stmt = querybuilder.del($query, _this);
    // run statement
    return _this.db.query(stmt.sql, stmt.params)
      .then(resolve, reject);
  };

  return this._enqueue(resolver)
    .return() // return void
    .nodeify(callback);
};

/**
 * Creates or updates (if already exist) the specified record(s) in table.
 * @param {(Object|Array.<Object>)} $values the record(s) to create/update
 * @param {Object} options query options
 * @param {Function} [callback] an optional callback function with (err, keys) arguments.
 * @returns {Promise} resolving to the primary key of the created/updated record(s)
 */
Table.prototype.set = function ($values, options, callback) {
  var _this = this;
  var resolver;

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

  // define promise resolver
  resolver = function (resolve, reject) {
    // build parameterized SQL statement
    var stmt = querybuilder.upsert(_.assign(options, {$values: $values}), _this);
    // run statement
    return _this.db.query(stmt.sql, stmt.params)
      .then(resolve, reject);
  };

  return this._enqueue(resolver)
    .then(function (result) {
      var records = _.isPlainObject($values) ? [$values] : $values;
      var hasAutoIncPrimaryKey = _this.hasAutoIncPrimaryKey();
      var insertedRows = 0;

      return records
        .map(function (record) {
          var obj = {};

          // check if record contains primary key
          var containsPrimaryKey = _this.primaryKey.every(function (k) {
            return record.hasOwnProperty(k);
          });

          if (containsPrimaryKey) return _.pick(record, _this.primaryKey);

          // check if table has simple auto-inc primary key
          if (hasAutoIncPrimaryKey) {
            obj[_this.primaryKey[0]] = result.insertId + insertedRows;
            insertedRows++;
            return obj;
          }

          // return empty object by default
          return {};
        });
    })
    .then(function (records) {
      if (_.isPlainObject($values)) {
        return records[0];
      }
      return records;
    })
    .nodeify(callback);
};

/**
 * Creates the specified record(s) in table.
 * @param {(Object|Array.<Object>)} $values the attributes of the record(s) to create
 * @param {Object} options query options
 * @param {Function} [callback] an optional callback function with (err, keys) arguments.
 * @returns {Promise} resolving to the primary key of the created record(s).
 */
Table.prototype.add = function ($values, options, callback) {
  var _this = this;
  var resolver;

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

  // define promise resolver
  resolver = function (resolve, reject) {
    // build parameterized SQL statement
    var stmt = querybuilder.insert(_.assign(options, {$values: $values}), _this);
    // run statement
    return _this.db.query(stmt.sql, stmt.params)
      .then(resolve, reject);
  };

  // run statement
  return this._enqueue(resolver)
    .then(function (result) {
      var records = _.isPlainObject($values) ? [$values] : $values;
      var hasAutoIncPrimaryKey = _this.hasAutoIncPrimaryKey();

      return records
        .map(function (record, i) {
          var obj = {};

          // check if table has simple auto-inc primary key
          if (hasAutoIncPrimaryKey) {
            obj[_this.primaryKey[0]] = result.insertId + i;
            return obj;
          }

          // extract primary key from record
          return _.pick(record, _this.primaryKey);
        });
    })
    .then(function (records) {
      if (_.isPlainObject($values)) {
        return records[0];
      }
      return records;
    })
    .nodeify(callback);
};

module.exports = Table;
