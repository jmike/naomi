var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Promise = require('bluebird');
var _ = require('lodash');

var operators = ['=', '==', '===', '!=', '!==', '<>', '>', '>=', '<', '<=', '~'];

/**
 * Constructs a new Table instance.
 * @param {Database} db the database that the table belongs to.
 * @param {string} name the name of the table.
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

  // load table metadata
  if (db.isConnected) {
    this._loadMeta();
  } else {
    // wait for db connection
    db.once('connect', this._loadMeta.bind(this));
  }
}

// @extends EventEmitter
util.inherits(Table, EventEmitter);

/**
 * Retrieves column metadata from database.
 * @param {function} [callback] an optional callback function with (err, columns) arguments.
 * @returns {Promise} resolving to Array.<object>
 */
Table.prototype.getColumns = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Retrieves primary key metadata from database.
 * @param {function} [callback] an optional callback function with (err, primaryKey) arguments.
 * @returns {Promise} resolving to Array.<string>
 */
Table.prototype.getPrimaryKey = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Retrieves unique key metadata from database.
 * @param {function} [callback] an optional callback function with (err, uniqueKeys) arguments.
 * @returns {Promise} resolving to object
 */
Table.prototype.getUniqueKeys = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Retrieves index key metadata from database.
 * @param {function} [callback] an optional callback function with (err, indexKeys) arguments.
 * @returns {Promise} resolving to object
 * @private
 */
Table.prototype.getIndexKeys = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Retrieves foreign key metadata from database.
 * @param {function} [callback] an optional callback function with (err, foreignKeys) arguments.
 * @returns {Promise} resolving to object
 * @private
 */
Table.prototype.getForeignKeys = function (callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Loads table metadata from database.
 * @param {function} [callback] an optional callback function with (err, foreignKeys) arguments.
 * @returns {Promise}
 * @emits Database#ready
 * @emits Database#error
 * @private
 */
Table.prototype._loadMeta = function (callback) {
  var _this = this;

  // make sure table exists in db
  this.db.hasTable(this.name)
    .then(function (hasTable) {
      if (!hasTable) {
        _this.emit('error', new Error('Table "' + _this.name + '" does not exist in database'));
        return;
      }
      // retrieve metadata
      return Promise.props({
        columns: _this.getColumns(),
        primaryKey: _this.getPrimaryKey(),
        uniqueKeys: _this.getUniqueKeys(),
        indexKeys: _this.getIndexKeys(),
        // foreignKeys: _this._getForeignKeys()
      })
        .then(function(results) {
          // update table properties + emit @ready
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
 * Parses the given expression, as part of a selector, and returns an object to use in a SQL expression.
 * @param {object} expr an object with a single property, where key represents the operator.
 * @returns {object}
 * @throws {Error} if expression is unspecified or invalid.
 * @private
 */
Table.prototype._parseExpression = function (expr) {
  var keys = Object.keys(expr);

  if (keys.length !== 1) {
    throw new Error('Invalid expression in query selector: object must contain exactly one property');
  }

  if (operators.indexOf(keys[0]) === -1) {
    throw new Error('Unknown operator "' + keys[0] + '" in query selector');
  }

  return expr;
};

/**
 * Parses the given input and returns an array of objects to use in a WHERE clause.
 * @param {(boolean|number|string|Date|object|Array.<object>)} selector a selector to match records in database.
 * @returns {(object|Array.<object>)}
 * @throws {Error} if selector is unspecified or invalid.
 * @private
 */
Table.prototype._parseSelector = function (selector, level) {
  var obj = {};

  level = level || 0;

  // check if selector is array
  if (level === 0 && _.isArray(selector)) {
    return selector.map(function (e) {
      return this._parseSelector(e, 1);
    }, this);
  }

  // check if selector is object
  if (_.isObject(selector)) {
    _.forOwn(selector, function (v, k) {
      if (!this.hasColumn(k)) {
        throw new Error(
          'Invalid query selector; ' +
          'column ' + k + ' does not exist in table ' + this.name
        );
      }

      if (_.isPlainObject(v)) {
        obj[k] = this._parseExpression(v);
      } else { // plain value
        obj[k] = {'=': v};
      }

    }, this);

    return obj;
  }

  // check if selector is number, string, date or boolean
  if (_.isNumber(selector) || _.isString(selector) || _.isDate(selector) || _.isBoolean(selector)) { // plain value selector
    if (this.primaryKey.length !== 1) {
      throw new Error(
        'Invalid query selector; ' +
        'primary key is compound or non existent, thus plain value selectors are useless'
      );
    }

    obj[this.primaryKey[0]] = {'=': selector};
    return obj;
  }

  throw new Error('Invalid query selector');
};

/**
 * Parses the given input and returns an object (or an array of objects) to use in an ORDER BY clause.
 * @param {(string|object|Array.<object>)} [order] the order input.
 * @returns {(object|Array.<object>)}
 * @throws {Error} if order is unspecified or invalid.
 * @private
 *
 * @example
 * tables._parseOrder('id');
 * tables._parseOrder({'id': 'desc'});
 * tables._parseOrder([{'name': 'desc'}, 'id']);
 */
Table.prototype._parseOrder = function (order) {
  var re = /^(asc|desc)$/i;
  var obj = {};
  var keys;
  var k;
  var v;

  // check if order is object, i.e. standard format
  if (_.isPlainObject(order)) {

    keys = Object.keys(order);

    if (keys.length !== 1) {
      throw new Error('Invalid query order: object must contain exactly one property');
    }

    k = keys[0];
    v = order[k];

    if (!this.hasColumn(k)) {
      throw new Error('Invalid query order: column "' + k + '" cannot be found in table "' + this.name + '"');
    }

    if (!re.test(v)) {
      throw new Error('Invalid query order: value in order expression should match either "asc" or "desc"');
    }

    return order;
  }

  // check if order is string
  if (_.isString(order)) {

    obj[order] = 'asc'; // set value to 'asc' by default
    return this._parseOrder(obj);
  }

  // check if order is array
  if (_.isArray(order)) {

    return order.map(function (e) {
      return this._parseOrder(e);
    }, this);
  }

  throw new Error('Invalid query order: expected string, plain object or Array, received "' + typeof(order) + '"');
};

/**
 * Parses the given input and returns a number to use in a SQL limit clause.
 * @param {(string|number)} limit a String or a Number representing a positive integer.
 * @return {number}
 * @throws {Error} if limit is unspecified or invalid.
 * @private
 *
 * @example
 * tables._parseLimit('10');
 * tables._parseLimit(20);
 */
Table.prototype._parseLimit = function (limit) {
  if (_.isString(limit)) {
    return this._parseLimit(parseInt(limit, 10));
  }

  if (_.isNumber(limit)) {
    if (limit % 1 !== 0 || limit < 1) {
      throw new Error('Invalid limit: expected a positive integer');
    }

    return limit;
  }

  throw new Error('Invalid limit: expected number or string, received ' + limit);
};

/**
 * Parses the given input and returns a number to use in a SQL offset clause.
 * @param {(string|number)} [offset] a String or a Number representing a non-negative integer, e.g. '10' or 2.
 * @returns {number}
 * @throws {Error} if offset is unspecified or invalid.
 * @private
 *
 * @example
 * tables._parseOffset('10');
 * tables._parseOffset(20);
 */
Table.prototype._parseOffset = function (offset) {
  if (_.isString(offset)) {
    return this._parseLimit(parseInt(offset, 10));
  }

  if (_.isNumber(offset)) {
    if (offset % 1 !== 0 || offset < 0) {
      throw new Error('Invalid offset: expected a non-negative integer');
    }

    return offset;
  }

  throw new Error('Invalid offset: expected object or string, received ' + offset);
};

/**
 * Parses the given record attributes based on this table columns.
 * @param {(object|Array.<object>)} attrs the record attributes.
 * @returns {(object|Array.<object>)}
 * @throws {Error} if attrs is unspecified or invalid
 * @private
 */
Table.prototype._parseAttributes = function (attrs, level) {
  level = level || 0;

  // attrs is plain object
  if (_.isPlainObject(attrs)) {
    Object.keys(attrs).forEach(function (column) {
      if (!this.hasColumn(column)) {
        throw new Error(
          'Invalid record attributes; ' +
          'column ' + column + ' does not exist in table ' + this.name
        );
      }
    }, this);

    return attrs;
  }

  // attrs is array
  if (level === 0 && _.isArray(attrs)) {
    return attrs.map(function (obj) {
      return this._parseAttributes(obj, 1);
    }, this);
  }

  // default
  throw new Error(
    'Invalid record attributes; ' +
    'expected object or Array, received ' + typeof(attrs)
  );
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
  return Promise.resolve(options);
};

/**
 * Retrieves the designated record(s) from this table.
 * @param {(boolean|number|string|Date|object|Array.<object>|null)} selector selector to match record(s) in table.
 * @param {object} [options] query options.
 * @param {(string|object|Array.<object|string>)} [options.order] an order expression to sort records.
 * @param {(number|string)} [options.limit] max number of records to return from table - must be a positive integer, i.e. limit > 0.
 * @param {(number|string)} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise} resolving to an Array.<object> of records.
 */
Table.prototype.get = function (selector, options, callback) {
  var _this = this;
  var resolver;

  // handle optional "options" param
  if (!_.isPlainObject(options)) {
    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid query options, expected plain object, received ' + typeof(options))
        .nodeify(callback);
    }

    options = {};
  }

  resolver = function (resolve, reject) {
    if (!_this.db.hasTable(_this.name)) {
      return reject('Table "' + _this.name + '" cannot be found in database');
    }

    try {
      if (selector) options.selector = _this._parseSelector(selector);
      if (options.order) options.order = _this._parseOrder(options.order);
      if (options.limit) options.limit = _this._parseLimit(options.limit);
      if (options.offset) options.offset = _this._parseOffset(options.offset);
    } catch (err) {
      return reject(err);
    }

    resolve(_this._get(options));
  };

  return new Promise(function(resolve, reject) {
    if (_this.db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      _this.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
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
  return Promise.resolve(options);
};

/**
 * Counts the designated record(s) in this table.
 * @param {(boolean|number|string|Date|object|Array.<object>|null)} selector selector to match record(s) in table.
 * @param {object} [options] query options.
 * @param {(number|string)} [options.limit] max number of records to count from table - must be a positive integer, i.e. limit > 0.
 * @param {(number|string)} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise} resolving to the count of records.
 */
Table.prototype.count = function (selector, options, callback) {
  var _this = this;
  var resolver;

  // handle optional "options" param
  if (!_.isPlainObject(options)) {
    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid query options, expected plain object, received ' + typeof(options))
        .nodeify(callback);
    }

    options = {};
  }

  resolver = function (resolve, reject) {
    if (!_this.db.hasTable(_this.name)) {
      return reject('Table "' + _this.name + '" cannot be found in database');
    }

    try {
      if (selector) options.selector = _this._parseSelector(selector);
      if (options.limit) options.limit = _this._parseLimit(options.limit);
      if (options.offset) options.offset = _this._parseOffset(options.offset);
    } catch (err) {
      return reject(err);
    }

    resolve(_this._count(options));
  };

  return new Promise(function(resolve, reject) {
    if (_this.db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      _this.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
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
  return Promise.resolve(options);
};

/**
 * Deletes the designated record(s) from this table.
 * @param {(boolean|number|string|Date|object|Array.<object>|null)} selector selector to match record(s) in table.
 * @param {object} [options] query options.
 * @param {(string|object|Array.<object|string>)} [options.order] an order expression to sort records.
 * @param {(number|string)} [options.limit] max number of records to return from database - must be a positive integer, i.e. limit > 0.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise}
 */
Table.prototype.del = function (selector, options, callback) {
  var _this = this;
  var resolver;

  // handle optional "options" param
  if (!_.isPlainObject(options)) {
    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid query options, expected plain object, received ' + typeof(options))
        .nodeify(callback);
    }

    options = {};
  }

  resolver = function (resolve, reject) {
    if (!_this.db.hasTable(_this.name)) {
      return reject('Table "' + _this.name + '" cannot be found in database');
    }

    try {
      if (selector) options.selector = _this._parseSelector(selector);
      if (options.order) options.order = _this._parseOrder(options.order);
      if (options.limit) options.limit = _this._parseLimit(options.limit);
    } catch (err) {
      return reject(err);
    }

    resolve(_this._del(options));
  };

  return new Promise(function(resolve, reject) {
    if (_this.db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      _this.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
};

/**
 * Creates or updates (if already exists) the specified record(s) in this table.
 * @param {(object|Array.<object>)} attrs the attributes of the record(s) to create/update.
 * @returns {Promise} resolving to the primary key of the created/updated record(s).
 */
Table.prototype._set = function (attrs) {
  return Promise.resolve(attrs);
};

/**
 * Creates or updates (if already exists) the specified record(s) in this table.
 * @param {(object|Array<object>)} attrs the attributes of the record(s) to create/update.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise} resolving to the primary key of the created/updated record(s).
 */
Table.prototype.set = function (attrs, callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve, reject) {
    var values;

    // make sure table exists in database
    if (!_this.db.hasTable(_this.name)) {
      return reject('Table "' + _this.name + '" cannot be found in database');
    }

    try {
      if (_.isArray(attrs)) {
        values = attrs.map(function (e) {
          return _this._parseAttributes(e);
        });
      } else {
        values = _this._parseAttributes(attrs);
      }
    } catch (err) {
      return reject(err);
    }

    resolve(_this._set(values));
  };

  return new Promise(function(resolve, reject) {
    if (_this.db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      _this.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
};

/**
 * Creates the specified record(s) in this table.
 * @param {(object|Array.<object>)} attrs the attributes of the record(s) to create.
 * @returns {Promise} resolving to the primary key of the created record(s).
 */
Table.prototype._add = function (attrs) {
  return Promise.resolve(attrs);
};

/**
 * Creates the specified record(s) in this table.
 * @param {(object|Array<object>)} attrs the attributes of the record(s) to create.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise} resolving to the primary key of the created record(s).
 */
Table.prototype.add = function (attrs, callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve, reject) {
    var values;

    // make sure table exists in database
    if (!_this.db.hasTable(_this.name)) {
      return reject(new Error('Table "' + _this.name + '" cannot be found in database'));
    }

    try {
      values = _this._parseAttributes(attrs);
    } catch (err) {
      return reject(err);
    }

    resolve(_this._add(values));
  };

  return new Promise(function(resolve, reject) {
    if (_this.db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      _this.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
};

// /**
//  * Retrieves the designated record(s) from the given related table from database.
//  * @param {String} table the name of the related table.
//  * @param {Boolean|Number|String|Date|object|Array.<Object>} [selector] selector to match the record(s) in database.
//  * @param {Function} callback a callback function i.e. function(error, data).
//  */
// Table.prototype.getRelated = function (table, selector, callback) {
//   var _this = this,
//     sql, params, path, whereClause;
//
//   // postpone if not ready
//   if (!this.db.isReady) {
//     this._enqueue(this.getRelated.bind(this, table, selector, callback));
//     return;
//   }
//
//   // make sure table exists in db
//   if (!this.db.hasTable(this.name)) return callback(
//     new Error('Table "' + this.name + '" cannot be found in database')
//   );
//
//   // make sure related table exists in db
//   if (!this.db.hasTable(table)) return callback(
//     new Error('Related table "' + table + '" cannot be found in database')
//   );
//
//   // calculate path to related table
//   path = this.db._calculatePath(this.table, table);
//
//   // make sure tables are actually related
//   if (path === null) return callback(
//     new Error('Tables "' + this.table + '" and "' + table + '" are not related; did you forget to set a foreign key?')
//   );
//
//   // compile a parameterized SELECT statement
//   sql = 'SELECT `' + table + '`.* ' +
//     path
//       .map(function (table, i) {
//         var ref, constraints;
//
//         if (i === 0) return 'FROM `' + table + '`';
//
//         ref = path[i - 1];
//         constraints = _this.db.getTableMeta(table).related[ref];
//
//         return 'INNER JOIN `' + table + '` ON ' +
//           Object.keys(constraints)
//             .map(function (k) {
//               return '`' + ref + '`.' + k + ' = `' + table + '`.' + constraints[k];
//             })
//             .join(' AND ');
//       })
//       .join(' ');
//   params = [];
//
//   // handle optional "selector" param
//   if (typeof selector === 'function') {
//     callback = selector;
//     selector = null;
//   }
//
//   // append a WHERE clause if selector is specified
//   if (selector) {
//
//     try {
//       whereClause = this._parseSelector(selector, {qualified: true});
//     } catch (err) {
//       return callback(err);
//     }
//
//     sql += ' WHERE ' + whereClause.sql;
//     params.push.apply(params, whereClause.params);
//   }
//
//   sql += ';';
//
//   // run Forrest, run
//   this.db.query(sql, params, callback);
// };

module.exports = Table;
