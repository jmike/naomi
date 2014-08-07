var _ = require('lodash'),
  Promise = require('bluebird');

/**
 * Constructs a new Table, i.e. an object representing a relational database table.
 * @param {Database} db a Naomi database instance.
 * @param {String} name the name of the table in database.
 * @constructor
 */
function Table(db, name) {
  this.db = db;
  this.name = name;

  this.columns = {};
  this.primaryKey = [];
  this.uniqueKeys = {};
  this.indexKeys = {};

  this.queryBuilder = new db._engine.QueryBuilder(this);

  db.on('ready', function () {
    this._loadMeta();
  }.bind(this));

  // check if db is already loaded
  if (db.isReady) this._loadMeta();
}

/**
 * Loads metadata from database.
 * @private
 */
Table.prototype._loadMeta = function () {
  var meta = this.db.getTableMeta(this.name);

  if (meta) {
    this.columns = meta.columns;
    this.primaryKey = meta.primaryKey;
    this.uniqueKeys = meta.uniqueKeys;
    this.indexKeys = meta.indexKeys;
  }
};

/**
 * Indicates whether the specified column exists in table,
 * This method will always return false until database is ready.
 * @param {String} name the name of the column.
 * @returns {Boolean}
 * @example
 *
 * table.hasColumn('id');
 */
Table.prototype.hasColumn = function (name) {
  return this.columns.hasOwnProperty(name);
};

/**
 * Indicates whether the specified column(s) represent a primary key.
 * Primary keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params in this function.
 * This method will always return false until database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
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
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * table.isUniqueKey('pid');
 */
Table.prototype.isUniqueKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this.uniqueKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit once verdict is true (return false breaks the loop)
  });

  return verdict;
};

/**
 * Indicates whether the specified column(s) represent an index key.
 * Index keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * This method will always return false until database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * table.isIndexKey('firstName', 'lastName');
 */
Table.prototype.isIndexKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this.indexKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit once verdict is true (return false breaks the loop)
  });

  return verdict;
};

/**
 * Parses the given expression, as part of a selector, and returns an object to use in a SQL expression.
 * @param {Object} expr an object with a single property, where key represents the operator.
 * @returns {Object}
 * @throws {Error} if selector is unspecified or invalid.
 * @private
 */
Table.prototype._parseExpression = function (expr) {
  var operators = ['=', '==', '===', '!=', '!==', '<>', '>', '>=', '<', '<=', '~'],
    keys = Object.keys(expr);

  if (keys.length !== 1) throw new Error('Invalid expression in selector: object must contain exactly one key-value property');
  if (operators.indexOf(keys[0]) === -1) throw new Error('Unable to parse unknown operator "' + keys[0] + '"');

  return expr;
};

/**
 * Parses the given input and returns an object (or an array of objects) to use in a SQL where clause.
 * @param Boolean|Number|String|Date|Object|Array.<Object>} selector
 * @returns {Object|Array<Object>}
 * @throws {Error} if selector is unspecified or invalid.
 * @private
 */
Table.prototype._parseSelector = function (selector) {
  var obj = {};

  if (_.isPlainObject(selector)) { // standard selector type
    _.forOwn(selector, function (v, k) {
      if (!this.hasColumn(k)) throw new Error('Column "' + k + '" cannot not be found in table "' + this.name + '"');

      if (_.isPlainObject(v)) {
        selector[k] = this._parseExpression(v);
      }
    }, this);

    return selector;
  }

  if (_.isNumber(selector) || _.isString(selector) || _.isDate(selector) || _.isBoolean(selector)) { // plain value selector
    if (this.primaryKey.length !== 1) throw new Error('Primary key is compound or non existent, thus Boolean, Number, String and Date selectors are useless');

    obj[this.collection.primaryKey[0]] = selector;

    return obj;
  }

  if (_.isArray(selector)) {
    return selector.map(function (e) {
      return this._parseSelector(e);
    }, this);
  }

  throw new Error('Invalid or unspecified selector param');
};

/**
 * Parses the given input and returns an object (or an array of objects) to use in a SQL order clause.
 * @param {String|Object|Array<Object>} order the order input, e.g. 'name', {'name': 'desc'}, [{'name': 'desc'}, 'id'].
 * @returns {Object|Array<Object>}
 * @throws {Error} if order is unspecified or invalid.
 * @private
 */
Table.prototype._parseOrder = function (order) {
  var re = /^(asc|desc)$/i,
    keys, k, v;

  if (_.isPlainObject(order)) { // standard format
    keys = Object.keys(order);

    if (keys.length !== 1) throw new Error('Invalid order parameter: object must contain exactly one key-value property');

    k = keys[0];
    v = order[k];

    if (!this.hasColumn(k)) throw new Error('Column "' + k + '" cannot be found in table "' + this.name + '"');
    if (!re.test(v)) throw new Error('Value in order expression should match either "asc" or "desc"');

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

  throw new Error('Invalid or unspecified order parameter');
};

/**
 * Parses the given input and returns a number to use in a SQL limit clause.
 * @param {String|Number} limit a String or a Number representing a positive integer, e.g. '10' or 2.
 * @return {Number}
 * @throws {Error} if limit is unspecified or invalid.
 * @private
 */
Table.prototype._parseLimit = function (limit) {
  var n = parseInt(limit, 10);

  if (n % 1 !== 0 || n < 1) {
    throw new Error('Invalid or unspecified limit param: expecting a String or Number representing a positive integer');
  }

  return n;
};

/**
 * Parses the given input and returns a number to use in a SQL offset clause.
 * @param {String|Number} offset a String or a Number representing a non-negative integer, e.g. '10' or 2.
 * @returns {Number}
 * @throws {Error} if offset is unspecified or invalid.
 * @private
 */
Table.prototype._parseOffset = function (offset) {
  var n = parseInt(offset, 10);

  if (n % 1 !== 0 || n < 0) {
    throw new Error('Invalid or unspecified offset param: expecting a String or Number representing a non-negative integer');
  }

  return n;
};

/**
 * Retrieves the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array<Object>|Null} selector a selector to match record(s) in database.
 * @param {Object} [options] query options.
 * @param {Function} [callback] an optional callback function i.e. function(err, records).
 * @throws {Error} if parameters are invalid.
 * @returns {Promise}
 */
Table.prototype.get = function (selector, options, callback) {
  var self = this,
    resolver;

  // validate "selector" param
  if (
    !_.isBoolean(selector) &&
    !_.isNumber(selector) &&
    !_.isString(selector) &&
    !_.isPlainObject(selector) &&
    !_.isArray(selector) &&
    !_.isDate(selector) &&
    !_.isNull(selector)
  ) {
    return Promise.reject('Invalid or unspecified selector param').nodeify(callback);
  }

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid or unspecified options param').nodeify(callback);
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

    // compile a parameterized SELECT query
    try {
      query = self.queryBuilder.compileSelectSQL(selector, options);
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
    if (self.isReady) {
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
 * @param {Boolean|Number|String|Date|Object|Array<Object>|Null} selector a selector to match the record(s) in database.
 * @param {Object} [options] query options.
 * @param {Function} [callback] an optional callback function i.e. function(err, count).
 * @returns {Promise}
 */
Table.prototype.count = function (selector, options, callback) {
  var self = this,
    resolver;

  // validate "selector" param
  if (
    !_.isBoolean(selector) &&
    !_.isNumber(selector) &&
    !_.isString(selector) &&
    !_.isPlainObject(selector) &&
    !_.isArray(selector) &&
    !_.isDate(selector) &&
    !_.isNull(selector)
  ) {
    return Promise.reject('Invalid or unspecified selector param').nodeify(callback);
  }

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid or unspecified options param').nodeify(callback);
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

    // compile a parameterized COUNT query
    try {
      query = self.queryBuilder.compileCountSQL(selector, options);
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
    if (self.isReady) {
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
 * This is no more than a handy alias to #count(null, options, callback).
 * @param {Object} [options] query options.
 * @param {Function} [callback] an optional callback function i.e. function(err, count).
 * @returns {Promise}
 */
Table.prototype.countAll = function (options, callback) {
  return this.count(null, options, callback);
};

/**
 * Creates or updates the specified record in database.
 * @param {Array<Object>|Object} attrs the record attributes.
 * @param {Function} [callback] an optional callback function i.e. function(error, data).
 * @returns {Promise}
 */
Table.prototype.set = function (attrs, callback) {
  var self = this,
    resolver;

  // set the resolver function
  resolver = function (resolve, reject) {

    var query;

    // make sure table exists in database
    if (!self.db.hasTable(self.name)) {
      return reject('Table "' + self.name + '" cannot be found in database');
    }

    // compile an parameterized UPSERT query
    try {
     query = self.queryBuilder.compileUpsertSQL(attrs);
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
    if (self.isReady) {
      resolver(resolve, reject);
    } else { // delay until ready
      self.db.once('ready', function () {
        resolver(resolve, reject);
      });
    }
  }).nodeify(callback);
};

/**
 * Deletes the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} selector a selector to match the record(s) in database.
 * @param {Object} [options] query options.
 * @param {Function} [callback] an optional callback function i.e. function(error, data).
 * @returns {Promise}
 */
Table.prototype.del = function (selector, options, callback) {
    var self = this,
    resolver;

  // validate "selector" param
  if (
    !_.isBoolean(selector) &&
    !_.isNumber(selector) &&
    !_.isString(selector) &&
    !_.isPlainObject(selector) &&
    !_.isArray(selector) &&
    !_.isDate(selector)
  ) {
    return Promise.reject('Invalid or unspecified selector param').nodeify(callback);
  }

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid or unspecified options param').nodeify(callback);
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

    // compile a parameterized DELETE query
    try {
      query = self.queryBuilder.compileDeleteSQL(selector, options);
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
    if (self.isReady) {
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
