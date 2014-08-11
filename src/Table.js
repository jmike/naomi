var Promise = require('bluebird'),
  _ = require('lodash'),
  MySQLQueryBuilder = require('./MySQLQueryBuilder'),
  PostgresQueryBuilder = require('./PostgresQueryBuilder'),
  operators = ['=', '==', '===', '!=', '!==', '<>', '>', '>=', '<', '<=', '~'];

function Table (db, name) {
  this.name = name;
  this.db = db;

  this._columns = {};
  this._primaryKey = [];
  this._uniqueKeys = {};
  this._indexKeys = {};

  if (db.type === 'mysql') {
    this._queryBuilder = new MySQLQueryBuilder(name);
  } else if (db.type === 'postgres') {
    this._queryBuilder = new PostgresQueryBuilder(name);
  } else {
    throw new Error('Unsupported database type: ' + db.type);
  }

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
  var meta = this.db.getTableMeta(this.name);

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
 * @throws {Error} if selector is unspecified or invalid.
 * @private
 */
Table.prototype._parseExpression = function (expr) {
  var keys = Object.keys(expr);

  if (keys.length !== 1) {
    throw new Error('Invalid expression in selector: object must contain exactly one property');
  }

  if (operators.indexOf(keys[0]) === -1) {
    throw new Error('Unknown operator "' + keys[0] + '" in selector expression');
  }

  return expr;
};

/**
 * Parses the given input and returns an object (or an array of objects) to use in a SQL where clause.
 * @param {(boolean|number|string|date|object|Array.<object>|null)} selector a selector to match records in database.
 * @returns {(Array.<object>|null)}
 * @throws {Error} if selector is unspecified or invalid.
 * @private
 */
Table.prototype._parseSelector = function (selector) {
  var obj = {};

  if (_.isPlainObject(selector)) { // standard selector type
    _.forOwn(selector, function (v, k) {

      if (!this.hasColumn(k)) {
        throw new Error('Invalid selector: column "' + k + '" cannot not be found in table "' + this.name + '"');
      }

      if (_.isPlainObject(v)) {
        selector[k] = this._parseExpression(v);
      } else { // plain value
        selector[k] = {'=': v};
      }

    }, this);

    return [selector];
  }

  if (_.isNumber(selector) || _.isString(selector) || _.isDate(selector) || _.isBoolean(selector)) { // plain value selector

    if (this._primaryKey.length !== 1) {
      throw new Error('Invalid selector: primary key is compound or non existent, thus plain value selectors are useless');
    }

    obj[this._primaryKey[0]] = {'=': selector};
    return [obj];
  }

  if (_.isArray(selector)) {
    return selector.map(function (e) {
      return this._parseSelector(e)[0];
    }, this);
  }

  if (_.isNull(selector)) {
    return null;
  }

  throw new Error('Invalid selector');
};

/**
 * Parses the given input and returns an array of objects to use in a SQL order clause.
 * @param {(string|object|Array.<object>|null)} [order] the order input.
 * @returns {(Array.<object>|null)}
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
      throw new Error('Invalid order: object must contain exactly one property');
    }

    k = keys[0];
    v = order[k];

    if (!this.hasColumn(k)) {
      throw new Error('Invalid order: column "' + k + '" cannot be found in table "' + this.name + '"');
    }

    if (!re.test(v)) {
      throw new Error('Invalid order: value in order expression should match either "asc" or "desc"');
    }

    return [order];
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
      return this._parseOrder(e)[0];
    }, this);
  }

  if (_.isNull(order)) {
    return null;
  }

  throw new Error('Invalid order: expected string, plain object or Array, received "' + typeof(order) + '"');
};

/**
 * Parses the given input and returns a number to use in a SQL limit clause.
 * @param {(string|number|null)} limit a String or a Number representing a positive integer.
 * @return {(number|null)}
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

  if (_.isNull(limit)) {
    return null;
  }

  throw new Error('Invalid limit: expected object or string, received "' + typeof(limit) + '"');
};

/**
 * Parses the given input and returns a number to use in a SQL offset clause.
 * @param {(string|number|null)} [offset] a String or a Number representing a non-negative integer, e.g. '10' or 2.
 * @returns {(number|null)}
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

  if (_.isNull(offset)) {
    return null;
  }

  throw new Error('Invalid offset: expected object or string, received "' + typeof(offset) + '"');
};

/**
 * Parses the given object and returns an array of values to use in a SQL INSERT statement.
 * @param {(object|Array.<object>)} values
 * @returns {Array.<object>}
 * @throws {Error} if values are unspecified or invalid.
 * @private
 */
Table.prototype._parseValues = function (values) {
  var diff;

  if (_.isPlainObject(values)) {
    diff = _.difference(Object.keys(values), Object.keys(this._columns));

    if (diff.length !== 0) {
      throw new Error('Invalid values: column ' + diff[0] + ' does not exist in table ' + this.name);
    }

    return [values];
  }

  if (_.isArray(values)) {
    return values.map(function (e) {
      return this._parseValues(e)[0];
    }, this);
  }

  throw new Error('Invalid values: expected object or array of objects, received ' + typeof(offset));
};

/**
 * Retrieves the designated record(s) from database.
 * @param {(boolean|number|string|date|object|Array.<object>|null)} selector a selector to match record(s) in database.
 * @param {object} [options] query options.
 * @param {(string|Object|Array.<object|string>)} [options.order] an order expression to sort records.
 * @param {(number|string)} [options.limit=1000] max number of records to return from database, must be a positive integer, i.e. limit > 0.
 * @param {(number|string)} [options.offset=0] number of records to skip from database, must be a non-negative integer, i.e. offset >= 0.
 * @param {function} [callback] an optional callback function i.e. function(err, records).
 * @returns {Promise}
 */
Table.prototype.get = function (selector, options, callback) {
  var self = this,
    resolver;

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid options: expected plain object, received "' + typeof(options) + '"')
        .nodeify(callback);
    }

    options = {};
  }

  // set the resolver function
  resolver = function (resolve, reject) {

    var query;

    // make sure table exists in database
    if (!self.db.hasTable(self.name)) {
      return reject('Table "' + self.name + '" cannot be found in database');
    }

    // compile a parameterized query
    try {
      query = self._queryBuilder.select({
        columns: Object.keys(self._columns),
        selector: self._parseSelector(selector || null),
        order: self._parseOrder(options.order || null),
        limit: self._parseLimit(options.limit || 1000),
        offset: self._parseOffset(options.offset || null)
      });
    } catch (err) {
      return reject(err.message);
    }

    // run the query
    self.db.query(query.sql, query.params).then(function (records) {
      resolve(records);
    }).catch(function (err) {
      reject(err);
    });

  };

  return new Promise(function(resolve, reject) {
    if (self.db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
};

/**
 * Retrieves all record(s) from database.
 * This is no more that a handy alias to #get(null, options, callback).
 * @param {Object} [options] query options.
 * @param {Function} [callback] an optional callback function i.e. function(err, records).
 * @returns {Promise}
 */
Table.prototype.getAll = function (options, callback) {
  return this.get(null, options, callback);
};

/**
 * Counts the designated record(s) in database.
 * @param {(boolean|number|string|date|object|Array.<object>|null)} selector a selector to match record(s) in database.
 * @param {object} [options] query options.
 * @param {(string|Object|Array.<object|string>)} [options.order] an order expression to sort records.
 * @param {(number|string)} [options.limit=1000] max number of records to return from database, must be a positive integer, i.e. limit > 0.
 * @param {(number|string)} [options.offset=0] number of records to skip from database, must be a non-negative integer, i.e. offset >= 0.
 * @param {function} [callback] an optional callback function i.e. function(err, records).
 * @returns {Promise}
 */
Table.prototype.count = function (selector, options, callback) {
  var self = this,
    resolver;

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid options: expected plain object, received "' + typeof(options) + '"')
        .nodeify(callback);
    }

    options = {};
  }

  // set the resolver function
  resolver = function (resolve, reject) {

    var query;

    // make sure table exists in database
    if (!self.db.hasTable(self.name)) {
      return reject('Table "' + self.name + '" cannot be found in database');
    }

    // compile a parameterized query
    try {
      query = self._queryBuilder.count({
        columns: Object.keys(self._columns),
        selector: self._parseSelector(selector || null),
        order: self._parseOrder(options.order || null),
        limit: self._parseLimit(options.limit || 1000),
        offset: self._parseOffset(options.offset || null)
      });
    } catch (err) {
      return reject(err.message);
    }

    // run the query
    self.db.query(query.sql, query.params).then(function (records) {
      resolve(records[0].count);
    }).catch(function (err) {
      reject(err);
    });

  };

  return new Promise(function(resolve, reject) {
    if (self.db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
};

/**
 * Counts all record(s) in table.
 * @param {object} [options] query options.
 * @param {(string|Object|Array.<object|string>)} [options.order] an order expression to sort records.
 * @param {(number|string)} [options.limit=1000] max number of records to return from database, must be a positive integer, i.e. limit > 0.
 * @param {(number|string)} [options.offset=0] number of records to skip from database, must be a non-negative integer, i.e. offset >= 0.
 * @param {function} [callback] an optional callback function i.e. function(err, records).
 * @returns {Promise}
 */
Table.prototype.countAll = function (options, callback) {
  return this.count(null, options, callback);
};

/**
 * Deletes the designated record(s) from database.
 * @param {(boolean|number|string|date|object|Array.<object>|null)} selector a selector to match record(s) in database.
 * @param {object} [options] query options.
 * @param {(string|Object|Array.<object|string>)} [options.order] an order expression to sort records.
 * @param {(number|string)} [options.limit=1000] max number of records to delete from database, must be a positive integer, i.e. limit > 0.
 * @param {function} [callback] an optional callback function i.e. function(err, data).
 * @returns {Promise}
 */
Table.prototype.del = function (selector, options, callback) {
    var self = this,
    resolver;

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid options: expected plain object, received "' + typeof(options) + '"')
        .nodeify(callback);
    }

    options = {};
  }

  // set the resolver function
  resolver = function (resolve, reject) {

    var query;

    // make sure table exists in database
    if (!self.db.hasTable(self.name)) {
      return reject('Table "' + self.name + '" cannot be found in database');
    }

    // compile a parameterized query
    try {
      query = self._queryBuilder.delete({
        selector: self._parseSelector(selector || null),
        order: self._parseOrder(options.order || null),
        limit: self._parseLimit(options.limit || 1000)
      });
    } catch (err) {
      return reject(err.message);
    }

    // run the query
    self.db.query(query.sql, query.params).then(function (data) {
      resolve(data);
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(function(resolve, reject) {
    if (self.db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
};

/**
 * Creates or updates (if already exists) the specified record(s) in database.
 * @param {(object|Array.<object>)} attrs the record attributes to create or update.
 * @param {function} [callback] an optional callback function i.e. function(err, data).
 * @returns {Promise}
 */
Table.prototype.set = function (attrs, callback) {
  var self = this,
    resolver, values, columns;

  // set the resolver function
  resolver = function (resolve, reject) {

    var query;

    // make sure table exists in database
    if (!self.db.hasTable(self.name)) {
      return reject('Table "' + self.name + '" cannot be found in database');
    }

    // compile a parameterized query
    try {
      values = self._parseValues(attrs);
      columns = Object.keys(values[0]); // assumes all objects have the same properties

      query = self._queryBuilder.upsert({
        columns: columns,
        values: values,
        updateColumns: _.difference(columns, this._primaryKey)
      });
    } catch (err) {
      return reject(err.message);
    }

    // run the query
    self.db.query(query.sql, query.params).then(function (data) {
      resolve(data);
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(function(resolve, reject) {
    if (self.db.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
};

// /**
//  * Retrieves the designated record(s) from the given related table from database.
//  * @param {String} table the name of the related table.
//  * @param {Boolean|Number|String|Date|Object|Array.<Object>} [selector] selector to match the record(s) in database.
//  * @param {Function} callback a callback function i.e. function(error, data).
//  */
// Table.prototype.getRelated = function (table, selector, callback) {
//   var self = this,
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
//         constraints = self.db.getTableMeta(table).related[ref];
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
