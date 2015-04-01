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
  var sql = [
    'SELECT column_name, data_type, is_nullable, column_default, collation_name',
    'FROM information_schema.columns',
    'WHERE table_catalog = $1',
    'AND table_schema NOT IN (\'pg_catalog\', \'information_schema\')',
    'AND table_name = $2',
    'ORDER BY ordinal_position ASC;'
  ].join(' ');

  var params = [this.db.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      return records.map(function (record) {
        return {
          name: record.column_name,
          type: record.data_type,
          isNullable: record.is_nullable === 'YES',
          default: record.column_default,
          collation: record.collation_name,
          comment: '' // TODO: extract comments
        };
      });
    })
    .nodeify(callback);
};

/**
 * Retrieves primary key metadata from database.
 * @param {function} [callback] an optional callback function with (err, primaryKey) arguments.
 * @returns {Promise} resolving to Array.<string>
 */
Table.prototype.getPrimaryKey = function (callback) {
  var sql = [
    'SELECT kcu.column_name',
    'FROM information_schema.table_constraints AS tc',
    'INNER JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name',
    'WHERE tc.constraint_catalog = $1',
    'AND tc.table_schema NOT IN (\'pg_catalog\', \'information_schema\')',
    'AND tc.table_name = $2',
    'AND tc.constraint_type = \'PRIMARY KEY\'',
    'ORDER BY kcu.ordinal_position ASC;'
  ].join(' ');

  var params = [this.db.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      return records.map(function (record) {
        return record.column_name;
      });
    })
    .nodeify(callback);
};

/**
 * Retrieves unique key metadata from database.
 * @param {function} [callback] an optional callback function with (err, uniqueKeys) arguments.
 * @returns {Promise} resolving to object
 */
Table.prototype.getUniqueKeys = function (callback) {
  var sql = [
    'SELECT tc.constraint_name, kcu.column_name',
    'FROM information_schema.table_constraints AS tc',
    'INNER JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name',
    'WHERE tc.constraint_catalog = $1',
    'AND tc.table_schema NOT IN (\'pg_catalog\', \'information_schema\')',
    'AND tc.table_name = $2',
    'AND tc.constraint_type = \'UNIQUE\'',
    'ORDER BY tc.constraint_name ASC, kcu.ordinal_position ASC'
  ].join(' ') + ';';

  var params = [this.db.name, this.name];

  return this.db.query(sql, params)
    .then(function (records) {
      var uniqueKeys = {};

      records.forEach(function (record) {
        uniqueKeys[record.constraint_name] = uniqueKeys[record.constraint_name] || [];
        uniqueKeys[record.constraint_name].push(record.column_name);
      });

      return uniqueKeys;
    })
    .nodeify(callback);
};

/**
 * Retrieves index key metadata from database.
 * @param {function} [callback] an optional callback function with (err, indexKeys) arguments.
 * @returns {Promise} resolving to object
 */
Table.prototype.getIndexKeys = function (callback) {
  return Promise.resolve({}).nodeify(callback);
};

/**
 * Retrieves foreign key metadata from database.
 * @param {function} [callback] an optional callback function with (err, foreignKeys) arguments.
 * @returns {Promise} resolving to object
 */
Table.prototype.getForeignKeys = function (callback) {
  var sql = [
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

  var params = [this.db.name, this.name];

  return this.db.query(sql, params)
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
      return parseInt(records[0].count, 10) || 0;
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

  // check if $values is array
  if (_.isArray($values)) {
    return Promise.map($values, function (obj) {
      return _this.set(obj);
    })
      .nodeify(callback);
  }

  // define promise resolver
  resolver = function (resolve, reject) {
    _this.db.beginTransaction()
      .then(function () {
        return this.query('LOCK TABLE "' + _this.name + '" IN SHARE ROW EXCLUSIVE MODE;');
      })
      .then(function () {
        // build parameterized SQL statement
        var stmt = querybuilder.upsert(_.assign(options, {$values: $values}), _this);
        // run statement
        return this.query(stmt.sql, stmt.params);
      })
      .then(function (records) {
        return this.commit()
          .return(records[0]);
      })
      .then(resolve, reject);
  };

  return this._enqueue(resolver)
    .nodeify(callback);
};

/**
 * Extract key to uniquely identify the given record.
 * @param {Object} record
 * @return {Array.<String>}
 */
Table.prototype.extractKey = function (record) {
  var columns = Object.keys(record);
  var isUniqueKey = false;
  var key;

  // set primary key intersection
  key = _.intersection(columns, this.primaryKey);

  if (key.length === this.primaryKey.length) {
    return key;
  }

  // set unique key intersection
  _.forOwn(this.uniqueKeys, function (uniqueKey) {
    key = _.intersection(columns, uniqueKey);

    if (key.length === uniqueKey.length) {
      isUniqueKey = true;
      return false; // exit
    }
  });

  if (isUniqueKey) return key;

  return [];
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
    .then(function (records) {
      if (_.isPlainObject($values)) {
        return records[0];
      }
      return records;
    })
    .nodeify(callback);
};

module.exports = Table;
