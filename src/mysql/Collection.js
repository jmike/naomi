var _ = require('lodash'),
  async = require('async'),
  operators = require('./operators.json');

/**
 * Constructs a new MySQL collection, i.e. an object representing a MySQL table.
 * @param {Database} db a MySQL database instance.
 * @param {String} table the name of a table in database.
 * @constructor
 */
function Collection(db, table) {
  var self = this,
    queue;

  this.db = db;
  this.table = table;

  this.columns = {};
  this.primaryKey = [];
  this.uniqueKeys = {};
  this.indexKeys = {};

  // setup queue to stack queries until db is ready
  queue = async.queue(function (task, callback) {
    task();
    callback();
  }, 10);
  queue.pause(); // pause by default
  this._queue = queue;

  db.on('ready', function () {
    self._loadMeta();
    self._queue.resume();
  });

  db.on('disconnect', function () {
    self._queue.pause();
  });

  // check if db is already loaded
  if (db.isReady) {
    this._loadMeta();
  }
}

/**
 * Loads metadata from database.
 * @private
 */
Collection.prototype._loadMeta = function () {
  var meta = this.db.getTableMeta(this.table);

  if (meta) {
    this.columns = meta.columns;
    this.primaryKey = meta.primaryKey;
    this.uniqueKeys = meta.uniqueKeys;
    this.indexKeys = meta.indexKeys;
  }
};

/**
 * Indicates whether the specified column exists in the collection.
 * Please note: this method is meant to be called after the database is ready.
 * @param {String} column the name of the column.
 * @returns {Boolean}
 * @example
 *
 * collection.hasColumn('name');
 */
Collection.prototype.hasColumn = function (column) {
  return this.columns.hasOwnProperty(column);
};

/**
 * Indicates whether the specified columns represent a primary key.
 * Primary keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after the database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * collection.isPrimaryKey('id');
 */
Collection.prototype.isPrimaryKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0);

  return _.xor(this.primaryKey, columns).length === 0;
};

/**
 * Indicates whether the specified columns represent a unique key.
 * Unique keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after the database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * collection.isUniqueKey('pid');
 */
Collection.prototype.isUniqueKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this.uniqueKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit when verdict is true
  });

  return verdict;
};

/**
 * Indicates whether the specified columns represent an index key.
 * Index keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
 * Please note: this method is meant to be called after the database is ready.
 * @param {...String} columns the name of the columns.
 * @returns {Boolean}
 * @example
 *
 * collection.isIndexKey('firstName', 'lastName');
 */
Collection.prototype.isIndexKey = function () {
  var columns = Array.prototype.slice.call(arguments, 0),
    verdict = false;

  _.forOwn(this.indexKeys, function (v) {
    verdict = _.xor(v, columns).length === 0;
    return !verdict; // exit when verdict is true
  });

  return verdict;
};

/**
 * Parses the given expression, as part of a selector, and returns a parameterized where clause.
 * @param {Object} expr an object with a single property, where key is the operator and value the value.
 * @returns {Object} with two properties: "sql" and "params".
 * @private
 */
Collection.prototype._parseExpression = function (expr) {
  var keys = Object.keys(expr),
    k, v, params, sql;

  if (keys.length !== 1) {
    throw new Error('Invalid expression in selector - expected single property, received ' + keys.length);
  }

  k = keys[0];

  if (!operators.hasOwnProperty(k)) {
    throw new Error('Unable to parse unknown operator "' + k + '"');
  }

  v = expr[k];
  k = operators[k]; // convert to sql equivalent

  if (k === '=' && v === null) {
    sql = 'IS NULL';
    params = [];

    return {sql: sql, params: params};
  }

  if (k === '!=' && v === null) {
    sql = 'IS NOT NULL';
    params = [];

    return {sql: sql, params: params};
  }

  sql = k + ' ?';
  params = [v];

  return {sql: sql, params: params};
};

/**
 * Parses the given selector and returns parameterized SQL to be used in a WHERE clause.
 * @param {Boolean|Number|String|Date|Object|Array} selector
 * @param {Object} [options]
 * @returns {Object} with two properties: "sql" and "params".
 * @throws {Error} if selector is unspecified or invalid.
 * @private
 */
Collection.prototype._parseSelector = function (selector, options) {
  var self = this,
    sql = [],
    params = [],
    obj = {},
    expr;

  options = options || {}; // handle optional "options" param

  if (_.isArray(selector)) { // array of selectors
    selector.forEach(function (selector) {
      var result = self._parseSelector(selector, options);
      sql.push(result.sql);
      params.push.apply(params, result.params);
    });
    return {sql: sql.join(' OR '), params: params};

  } else if (_.isNumber(selector) || _.isString(selector) || _.isDate(selector) || _.isBoolean(selector)) { // plain value selector
    // is primary key compound or non existent?
    if (this.primaryKey.length !== 1) {
      throw new Error(
        'Primary key is compound or non existent, thus Boolean, Number, String and Date selectors are useless'
      );
    }

    obj[this.primaryKey[0]] = selector;
    return this._parseSelector(obj, options);

  } else if (_.isPlainObject(selector)) { // standard selector type
    _.forOwn(selector, function (v, k) {
      if (!self.hasColumn(k)) {
        throw new Error('Column "' + k + '" could not be found in table "' + self.table + '"');
      }

      if (v === null) { // null value
        sql.push((options.qualified ? '`' + self.table + '`.' + k : '`' + k + '`') + ' IS NULL');

      } else if (_.isPlainObject(v)) { // expression supplied
        expr = self._parseExpression(v);
        sql.push((options.qualified ? '`' + self.table + '`.' + k : '`' + k + '`') + ' ' + expr.sql);
        params.push.apply(params, expr.params);

      } else { // plain value
        sql.push((options.qualified ? '`' + self.table + '`.' + k : '`' + k + '`') + ' = ?');
        params.push(v);
      }
    });

    return {sql: sql.join(' AND '), params: params};

  } else {
    throw new Error('Unexpected type of selector: ' + typeof(selector));
  }
};

/**
 * Parses the given order expression and returns SQL statement to be used in an ORDER BY clause.
 * @param {String|Object|Array<Object>} order an order expression, e.g. 'name', {'name': 'desc'}, [{'name': 'desc'}, 'id'].
 * @returns {String}
 * @throws {Error} if order is unspecified or invalid.
 * @private
 */
Collection.prototype._parseOrder = function (order) {
  var self = this,
    sql = [],
    re = /^(asc|desc)$/i,
    keys,
    k, v;

  if (_.isArray(order)) {
    order.forEach(function (e) {
      sql.push(self._parseOrder(e));
    });

  } else if (_.isString(order)) {
    k = order;

    if (!self.hasColumn(k)) throw new Error('Column "' + k + '" cannot be found in table "' + self.table + '"');
    sql.push('`' + k + '` ASC');

  } else if (_.isPlainObject(order)) {
    keys = Object.keys(order);

    if (keys.length !== 1) throw new Error('Order object should contain a single property');

    k = keys[0];
    v = order[k];

    if (!self.hasColumn(k)) throw new Error('Column "' + k + '" cannot be found in table "' + self.table + '"');
    if (!re.test(v)) throw new Error('Value in order expression should match either "asc" or "desc"');

    sql.push('`' + k + '` ' + v);

  } else {
    throw new Error('Unexpected type of order: ' + typeof(order));
  }

  return sql.join(', ');
};

/**
 * Parses the given limit expression and returns a number to be used in a LIMIT clause.
 * @param {String|Number} limit a limit expression, e.g. '10'.
 * @returns {Number}
 * @throws {Error} if limit is unspecified or invalid.
 * @private
 */
Collection.prototype._parseLimit = function (limit) {
  var n = parseInt(limit, 10);

  if (n % 1 !== 0 || n < 1) {
    throw new Error('Invalid limit expression - expecting a String or Number representing a positive integer');
  }

  return n;
};

/**
 * Parses the given offset expression and returns a number to be used in an OFFSET clause.
 * @param {String|Number} offset an offset expression, e.g. '10'.
 * @returns {Number}
 * @throws {Error} if offset is unspecified or invalid.
 * @private
 */
Collection.prototype._parseOffset = function (offset) {
  var n = parseInt(offset, 10);

  if (n % 1 !== 0 || n < 0) {
    throw new Error('Invalid offset expression - expecting a String or Number representing a non-negative integer');
  }

  return n;
};

/**
 * Retrieves the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} [selector] a selector to match the record(s) in database.
 * @param {Object} [options]
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.get = function (selector, options, callback) {
  var sql, params;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.get.bind(this, selector, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) return callback(
    new Error('Table "' + this.table + '" cannot be found in database')
  );

  // handle optional "selector" param
  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  // handle optional "options" param
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // compile a SELECT statement
  sql = 'SELECT * FROM ??';
  params = [this.table];

  // append a WHERE clause if selector is specified
  if (selector) {
    try {
      selector = this._parseSelector(selector);
    } catch (err) {
      return callback(err);
    }

    sql += ' WHERE ' + selector.sql;
    params.push.apply(params, selector.params);
  }

  // append an ORDER BY clause if order is specified in options
  if (options.order) {
    try {
      sql += ' ORDER BY ' + this._parseOrder(options.order);
    } catch (err) {
      return callback(err);
    }
  }

  // append a LIMIT clause if limit is specified in options
  if (options.limit) {
    try {
      sql += ' LIMIT ' + this._parseLimit(options.limit);
    } catch (err) {
      return callback(err);
    }
  }

  // append an OFFSET clause if offset is specified in options
  if (options.offset) {
    try {
      sql += ' OFFSET ' + this._parseOffset(options.offset);
    } catch (err) {
      return callback(err);
    }
  }

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, callback);
};

/**
 * Counts the designated record(s) in database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} [selector] a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.count = function (selector, callback) {
  var sql, params, whereClause;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.count.bind(this, selector, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) return callback(
    new Error('Table "' + this.table + '" cannot be found in database')
  );

  // handle optional "selector" param
  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  // compile a parameterized SELECT COUNT statement
  sql = 'SELECT COUNT(*) AS `count` FROM ??';
  params = [this.table];

  // append a WHERE clause if selector is specified
  if (selector) {

    try {
      whereClause = this._parseSelector(selector);
    } catch (err) {
      return callback(err);
    }

    sql += ' WHERE ' + whereClause.sql;
    params.push.apply(params, whereClause.params);
  }

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, function (error, records) {
    var count;

    if (error) return callback(error);
    count = records[0].count; // we need only the number

    callback(null, count);
  });
};

/**
 * Creates or updates the specified record in database.
 * @param {Object} properties the record's properties to be set in the database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.set = function (properties, callback) {
  var sql, params;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.set.bind(this, properties, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) return callback(
    new Error('Table "' + this.table + '" cannot be found in database')
  );

  // compile a parameterized INSERT [ON DUPLICATE KEY UPDATE] statement
  sql = 'INSERT INTO ?? SET ?';
  params = [this.table, properties];

  sql += ' ON DUPLICATE KEY UPDATE ' +
    _.without(Object.getOwnPropertyNames(properties), 'id')
    .map(function (k) {
      return '`' + k + '` = VALUES(`' + k + '`)';
    })
    .join(', ');

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, callback);
};

/**
 * Deletes the designated record(s) from database.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} selector a selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.del = function (selector, callback) {
  var sql, params, whereClause;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.del.bind(this, selector, callback));
    return;
  }

  // make sure table exists
  if (!this.db.hasTable(this.table)) return callback(
    new Error('Table "' + this.table + '" cannot be found in database')
  );

  // compile a parameterized DELETE statement
  sql = 'DELETE FROM ??';
  params = [this.table];

  // append a WHERE clause
  try {
    whereClause = this._parseSelector(selector);
  } catch (err) {
    return callback(err);
  }

  sql += ' WHERE ' + whereClause.sql;
  params.push.apply(params, whereClause.params);

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, callback);
};

/**
 * Retrieves the designated record(s) from the given related table from database.
 * @param {String} table the name of the related table.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>} [selector] selector to match the record(s) in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Collection.prototype.getRelated = function (table, selector, callback) {
  var self = this,
    sql, params, path, whereClause;

  // postpone if not ready
  if (!this.db.isReady) {
    this._queue.push(this.getRelated.bind(this, table, selector, callback));
    return;
  }

  // make sure collection table exists in db
  if (!this.db.hasTable(this.table)) return callback(
    new Error('Table "' + this.table + '" cannot be found in database')
  );

  // make sure related table exists in db
  if (!this.db.hasTable(table)) return callback(
    new Error('Related table "' + table + '" cannot be found in database')
  );

  // calculate path to related table
  path = this.db._calculatePath(this.table, table);

  // make sure tables are actually related
  if (path === null) return callback(
    new Error('Tables "' + this.table + '" and "' + table + '" are not related; did you forget to set a foreign key?')
  );

  // compile a parameterized SELECT statement
  sql = 'SELECT `' + table + '`.* ' +
    path
      .map(function (table, i) {
        var ref, constraints;

        if (i === 0) return 'FROM `' + table + '`';

        ref = path[i - 1];
        constraints = self.db.getTableMeta(table).related[ref];

        return 'INNER JOIN `' + table + '` ON ' +
          Object.keys(constraints)
            .map(function (k) {
              return '`' + ref + '`.' + k + ' = `' + table + '`.' + constraints[k];
            })
            .join(' AND ');
      })
      .join(' ');
  params = [];

  // handle optional "selector" param
  if (typeof selector === 'function') {
    callback = selector;
    selector = null;
  }

  // append a WHERE clause if selector is specified
  if (selector) {

    try {
      whereClause = this._parseSelector(selector, {qualified: true});
    } catch (err) {
      return callback(err);
    }

    sql += ' WHERE ' + whereClause.sql;
    params.push.apply(params, whereClause.params);
  }

  sql += ';';

  // run Forrest, run
  this.db.query(sql, params, callback);
};

module.exports = Collection;
