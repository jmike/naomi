var Promise = require('bluebird'),
  _ = require('lodash'),
  operators = ['=', '==', '===', '!=', '!==', '<>', '>', '>=', '<', '<=', '~'];

function Table (db, table) {
  this._db = db;
  this._table = table;
  this._columns = {};
  this._primaryKey = [];
  this._uniqueKeys = {};
  this._indexKeys = {};

  // load metadata
  if (db.isReady) {
    this._loadMeta();
  } else { // async
    db.on('ready', this._loadMeta.bind(this));
  }
}

/**
 * Loads table metadata from database.
 * @private
 */
Table.prototype._loadMeta = function () {
  var meta = this._db.getTableMeta(this._table);

  if (meta) {
    this._columns = meta.columns;
    this._primaryKey = meta.primaryKey;
    this._uniqueKeys = meta.uniqueKeys;
    this._indexKeys = meta.indexKeys;
  }
};

/**
 * Indicates whether the specified column exists in table,
 * This method will always return false until database is ready.
 * @param {string} name the name of the column.
 * @returns {boolean}
 * @example
 *
 * table.hasColumn('id');
 */
Table.prototype.hasColumn = function (name) {
  return this._columns.hasOwnProperty(name);
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
  return _.xor(this._primaryKey, columns).length === 0;
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
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this._uniqueKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit once verdict is true (return false breaks the loop)
  });

  return verdict;
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
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this._indexKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit once verdict is true (return false breaks the loop)
  });

  return verdict;
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
Table.prototype._parseSelector = function (selector) {
  var obj = {};

  if (_.isPlainObject(selector)) { // standard selector type
    _.forOwn(selector, function (v, k) {
      if (!this.hasColumn(k)) {
        throw new Error('Invalid query selector: column "' + k + '" does not exist in table "' + this._table + '"');
      }

      if (_.isPlainObject(v)) {
        selector[k] = this._parseExpression(v);
      } else { // plain value
        selector[k] = {'=': v};
      }
    }, this);

    return selector;
  }

  if (_.isNumber(selector) || _.isString(selector) || _.isDate(selector) || _.isBoolean(selector)) { // plain value selector
    if (this._primaryKey.length !== 1) {
      throw new Error('Invalid query selector: primary key is compound or non existent, thus plain value selectors are useless');
    }

    obj[this._primaryKey[0]] = {'=': selector};
    return obj;
  }

  if (_.isArray(selector)) {
    return selector.map(function (e) {
      return this._parseSelector(e);
    }, this);
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
  var re = /^(asc|desc)$/i,
    keys, k, v;

  if (_.isPlainObject(order)) { // standard format
    keys = Object.keys(order);

    if (keys.length !== 1) {
      throw new Error('Invalid query order: object must contain exactly one property');
    }

    k = keys[0];
    v = order[k];

    if (!this.hasColumn(k)) {
      throw new Error('Invalid query order: column "' + k + '" cannot be found in table "' + this._table + '"');
    }

    if (!re.test(v)) {
      throw new Error('Invalid query order: value in order expression should match either "asc" or "desc"');
    }

    return order;
  }

  if (_.isString(order)) {
    k = order;
    v = 'asc'; // set value to 'asc' by default

    order = {}; // reset order
    order[k] = v;

    return this._parseOrder(order);
  }

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
 * @param {object} [options] query options.
 * @param {(boolean|number|string|Date|object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {(string|object|Array.<object|string>)} [options.order] an order expression to sort records.
 * @param {(number|string)} [options.limit] max number of records to return from table - must be a positive integer, i.e. limit > 0.
 * @param {(number|string)} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise} resolving to an Array.<object> of records.
 */
Table.prototype.get = function (options, callback) {
  var self = this, resolver;

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
    if (!self._db.hasTable(self._table)) {
      return reject('Table "' + self._table + '" cannot be found in database');
    }

    try {
      if (options.selector) options.selector = self._parseSelector(options.selector);
      if (options.order) options.order = self._parseOrder(options.order);
      if (options.limit) options.limit = self._parseLimit(options.limit);
      if (options.offset) options.offset = self._parseOffset(options.offset);
    } catch (err) {
      return reject(err);
    }

    resolve(self._get(options));
  };

  return new Promise(function(resolve, reject) {
    if (self._db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self._db.once('ready', function () {
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
 * @param {object} [options] query options.
 * @param {(boolean|number|string|Date|object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {(number|string)} [options.limit] max number of records to count from table - must be a positive integer, i.e. limit > 0.
 * @param {(number|string)} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise} resolving to the count of records.
 */
Table.prototype.count = function (options, callback) {
  var self = this, resolver;

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
    if (!self._db.hasTable(self._table)) {
      return reject('Table "' + self._table + '" cannot be found in database');
    }

    try {
      if (options.selector) options.selector = self._parseSelector(options.selector);
      if (options.limit) options.limit = self._parseLimit(options.limit);
      if (options.offset) options.offset = self._parseOffset(options.offset);
    } catch (err) {
      return reject(err);
    }

    resolve(self._count(options));
  };

  return new Promise(function(resolve, reject) {
    if (self._db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self._db.once('ready', function () {
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
 * @param {object} [options] query options.
 * @param {(boolean|number|string|Date|object|Array.<object>)} [options.selector] a selector to match record(s) in database.
 * @param {(string|object|Array.<object|string>)} [options.order] an order expression to sort records.
 * @param {(number|string)} [options.limit] max number of records to return from database - must be a positive integer, i.e. limit > 0.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise}
 */
Table.prototype.del = function (options, callback) {
  var self = this, resolver;

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
    if (!self._db.hasTable(self._table)) {
      return reject('Table "' + self._table + '" cannot be found in database');
    }

    try {
      if (options.selector) options.selector = self._parseSelector(options.selector);
      if (options.order) options.order = self._parseOrder(options.order);
      if (options.limit) options.limit = self._parseLimit(options.limit);
    } catch (err) {
      return reject(err);
    }

    resolve(self._del(options));
  };

  return new Promise(function(resolve, reject) {
    if (self._db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self._db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
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
 * Creates or updates (if already exists) the specified record(s) in this table.
 * @param {(object|Array<object>)} attrs the record's attributes.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise} resolving to the updated/created records.
 */
Table.prototype.set = function (attrs, callback) {
  var self = this, columns, resolver;

  // extract columns from attrs
  if (_.isPlainObject(attrs)) {
    columns = Object.keys(attrs);
  } else if (_.isArray(attrs)) {
    columns = Object.keys(attrs[0]); // assuming all records in array have the same columns
  } else {
    return Promise.reject('Invalid record attributes: expected plain object or Array, received ' + typeof(attrs))
      .nodeify(callback);
  }

  resolver = function (resolve, reject) {
    var options = {}, arr;

    if (!self._db.hasTable(self._table)) {
      return reject('Table "' + self._table + '" cannot be found in database');
    }

    // make sure all columns exist in table
    arr = _.difference(columns, Object.keys(self._columns));
    if (arr.length !== 0) {
      return reject('Invalid record attributes: column ' + arr[0] + ' does not exist in table ' + self._table);
    }

    // set values
    options.values = attrs;

    // set columns to insert
    options.columns = columns;

    // set columns to update if record exists
    options.updateColumns = _.difference(columns, self._primaryKey);

    // set selector to check if record exists
    options.updateKeys = [];

    arr = _.intersection(columns, self._primaryKey);
    if (arr.length === self._primaryKey.length) {
      options.updateKeys.push(arr);
    }

    _.forOwn(self._uniqueKeys, function (uniqueKey) {
      arr = _.intersection(columns, uniqueKey);
      if (arr.length === uniqueKey.length) {
        options.updateKeys.push(arr);
      }
    });

    resolve(self._set(options));
  };

  return new Promise(function(resolve, reject) {
    if (self._db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self._db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
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

/**
 * Creates the specified record(s) in this table.
 * @param {(object|Array<object>)} attrs the record's attributes.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise} resolving to the created records.
 */
Table.prototype.set = function (attrs, callback) {
  var self = this, columns, resolver;

  // extract columns from attrs
  if (_.isPlainObject(attrs)) {
    columns = Object.keys(attrs);
  } else if (_.isArray(attrs)) {
    columns = Object.keys(attrs[0]); // assuming all records in array have the same columns
  } else {
    return Promise.reject('Invalid record attributes: expected plain object or Array, received ' + typeof(attrs))
      .nodeify(callback);
  }

  resolver = function (resolve, reject) {
    var options = {}, arr;

    if (!self._db.hasTable(self._table)) {
      return reject('Table "' + self._table + '" cannot be found in database');
    }

    // make sure all columns exist in table
    arr = _.difference(columns, Object.keys(self._columns));
    if (arr.length !== 0) {
      return reject('Invalid record attributes: column ' + arr[0] + ' does not exist in table ' + self._table);
    }

    // set values
    options.values = attrs;

    // set columns
    options.columns = columns;

    resolve(self._setNew(options));
  };

  return new Promise(function(resolve, reject) {
    if (self._db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self._db.once('ready', function () {
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
//   var self = this,
//     sql, params, path, whereClause;
//
//   // postpone if not ready
//   if (!this._db.isReady) {
//     this._enqueue(this.getRelated.bind(this, table, selector, callback));
//     return;
//   }
//
//   // make sure table exists in db
//   if (!this._db.hasTable(this._table)) return callback(
//     new Error('Table "' + this._table + '" cannot be found in database')
//   );
//
//   // make sure related table exists in db
//   if (!this._db.hasTable(table)) return callback(
//     new Error('Related table "' + table + '" cannot be found in database')
//   );
//
//   // calculate path to related table
//   path = this._db._calculatePath(this.table, table);
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
//         constraints = self._db.getTableMeta(table).related[ref];
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
//   this._db.query(sql, params, callback);
// };

module.exports = Table;
