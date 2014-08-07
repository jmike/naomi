var _ = require('lodash'),
  operators = require('./operators.json');

/**
 * Constructs a new MySQL QueryBuilder for the designated collection.
 * @param {Collection} collection the collection.
 * @constructor
 */
function QueryBuilder(collection) {
  this.collection = collection;
}

/**
 * Escapes the given column name to be used in a SQL query.
 * @param {String} column the name of the column.
 * @returns {String}
 * @private
 */
QueryBuilder.prototype._escape = function (column) {
  // if (table) {
  //   return '`' + table + '`.' + column;
  // }

  return '`' + column + '`';
};

/**
 * Parses the given expression, as part of a selector, and returns a parameterized SQL expression.
 * @param {Object} expr an object with a single property, where key represents the operator.
 * @returns {Object} with two properties: "sql" and "params".
 * @private
 */
QueryBuilder.prototype._parseExpression = function (expr) {
  var keys = Object.keys(expr),
    k, v, params, sql;

  if (keys.length !== 1) {
    throw new Error('Invalid expression in selector - expected an object with a single property, received an object with ' + keys.length);
  }

  k = keys[0];

  if (!operators.hasOwnProperty(k)) {
    throw new Error('Unable to parse unknown operator "' + k + '"');
  }

  v = expr[k];
  k = operators[k]; // convert to sql equivalent

  if (v === null && k === '=') {
    sql = 'IS NULL';
    params = [];

  } else if (v === null && k === '!=') {
    sql = 'IS NOT NULL';
    params = [];

  } else {
    sql = k + ' ?';
    params = [v];
  }

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a SQL where clause, based on the given selector.
 * @param Boolean|Number|String|Date|Object|Array.<Object>} selector
 * @returns {Object} with two properties: "sql" and "params".
 * @throws {Error} if selector is unspecified or invalid.
 * @private
 */
QueryBuilder.prototype._compileWhereClause = function (selector) {
  var sql = [],
    params = [],
    obj = {},
    expr;

  if (_.isPlainObject(selector)) { // standard selector type
    _.forOwn(selector, function (v, k) {
      if (!this.collection.hasColumn(k)) {
        throw new Error('Column "' + k + '" could not be found in table "' + this.collection.table + '"');
      }

      k = this._escape(k); // qualify column name

      if (v === null) { // null value
        sql.push(k + ' IS NULL');

      } else if (_.isPlainObject(v)) { // expression specified
        expr = this._parseExpression(v);
        sql.push(k + ' ' + expr.sql);
        params.push.apply(params, expr.params);

      } else { // plain value
        sql.push(k + ' = ?');
        params.push(v);
      }
    }, this);

    return {sql: sql.join(' AND '), params: params};

  } else if (_.isNumber(selector) || _.isString(selector) || _.isDate(selector) || _.isBoolean(selector)) { // plain value selector
    // is primary key compound or non existent?
    if (this.collection.primaryKey.length !== 1) {
      throw new Error(
        'Primary key is compound or non existent, thus Boolean, Number, String and Date selectors are useless'
      );
    }

    obj[this.collection.primaryKey[0]] = selector;
    return this._compileWhereClause(obj);

  } else if (_.isArray(selector)) { // array of selectors
    selector.forEach(function (selector) {
      var result = this._compileWhereClause(selector);
      sql.push(result.sql);
      params.push.apply(params, result.params);
    }, this);

    return {sql: sql.join(' OR '), params: params};

  } else {
    throw new Error('Unexpected type of selector: ' + typeof(selector));
  }
};

/**
 * Compiles and returns a SQL order clause, based on the given order expression.
 * @param {String|Object|Array<Object>} order the order expression, e.g. 'name', {'name': 'desc'}, [{'name': 'desc'}, 'id'].
 * @returns {String}
 * @throws {Error} if order is unspecified or invalid.
 * @private
 */
QueryBuilder.prototype._compileOrderClause = function (order) {
  var re = /^(asc|desc)$/i,
    sql = [],
    obj = {},
    keys,
    k, v;

  if (_.isPlainObject(order)) {
    keys = Object.keys(order);

    if (keys.length !== 1) {
      throw new Error('Order objects must contain a single property');
    }

    k = keys[0];
    v = order[k];

    if (!this.collection.hasColumn(k)) {
      throw new Error('Column "' + k + '" cannot be found in table "' + this.collection.table + '"');
    }

    if (!re.test(v)) {
      throw new Error('Value in order expression should match either "asc" or "desc"');
    }

    k = this._escape(k); // qualify column name
    v = v.toUpperCase();

    sql.push(k + ' ' + v);

  } else if (_.isString(order)) {
    k = order;
    obj[k] = 'asc';
    sql.push(this._compileOrderClause(obj));

  } else if (_.isArray(order)) {
    order.forEach(function (e) {
      sql.push(this._compileOrderClause(e));
    }, this);

  } else {
    throw new Error('Unexpected type of order: ' + typeof(order));
  }

  return sql.join(', ');
};

/**
 * Compiles and returns a SQL offset clause, based on the given offset.
 * @param {String|Number} offset a String or a Number representing a non-negative integer, e.g. '10' or 2.
 * @returns {Number}
 * @throws {Error} if offset is unspecified or invalid.
 * @private
 */
QueryBuilder.prototype._compileOffsetClause = function (offset) {
  var n = parseInt(offset, 10);

  if (n % 1 !== 0 || n < 0) {
    throw new Error('Invalid offset expression - expecting a String or Number representing a non-negative integer');
  }

  return n;
};

/**
 * Compiles and returns a SQL select statement.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>|Null} selector a selector to match the record(s) in the collection.
 * @param {Object} [options]
 * @returns {Object}
 * @throws {Error} if parameters are invalid
 */
QueryBuilder.prototype.compileSelectSQL = function (selector, options) {
  var sql, params, clause;

  // handle optional "options" param
  if (options === undefined) {
    options = {};
  }

  // init parameterized SQL query
  sql = 'SELECT * FROM `' + this.collection.table + '`';
  params = [];

  // check if selector exists (null denotes selector absense)
  if (selector !== undefined && selector !== null) {
    clause = this._compileWhereClause(selector);

    sql += ' WHERE ' + clause.sql;
    params.push.apply(params, clause.params);
  }

  // check if order option exists
  if (options.order !== undefined && options.order !== null) {
    clause = this._compileOrderClause(options.order);

    sql += ' ORDER BY ' + clause;
  }

  // check if limit option exists
  if (options.limit !== undefined && options.limit !== null) {
    clause = this._compileLimitClause(options.limit);

    sql += ' LIMIT ' + clause;
  }

  // check if offset option exists
  if (options.offset !== undefined && options.offset !== null) {
    clause = this._compileOffsetClause(options.offset);

    sql += ' OFFSET ' + clause;
  }

  sql += ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a SQL count statement.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>|Null} selector a selector to match the record(s) in the collection.
 * @param {Object} [options]
 * @returns {Object}
 * @throws {Error} if parameters are invalid
 */
QueryBuilder.prototype.compileCountSQL = function (selector, options) {
  var sql, params, clause;

  // handle optional "options" param
  if (options === undefined) {
    options = {};
  }

  // init parameterized SQL query
  sql = 'SELECT COUNT(*) AS `count` FROM `' + this.collection.table + '`';
  params = [];

  // check if selector exists (null denotes selector absense)
  if (selector !== undefined && selector !== null) {
    clause = this._compileWhereClause(selector);

    sql += ' WHERE ' + clause.sql;
    params.push.apply(params, clause.params);
  }

  // check if order option exists
  if (options.order !== undefined && options.order !== null) {
    clause = this._compileOrderClause(options.order);

    sql += ' ORDER BY ' + clause;
  }

  // check if limit option exists
  if (options.limit !== undefined && options.limit !== null) {
    clause = this._compileLimitClause(options.limit);

    sql += ' LIMIT ' + clause;
  }

  // check if offset option exists
  if (options.offset !== undefined && options.offset !== null) {
    clause = this._compileOffsetClause(options.offset);

    sql += ' OFFSET ' + clause;
  }

  sql += ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a SQL delete statement.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>|Null} selector a selector to match the record(s) in the collection.
 * @param {Object} [options]
 * @returns {Object}
 * @throws {Error} if parameters are invalid
 */
QueryBuilder.prototype.compileDeleteSQL = function (selector, options) {
  var sql, params, clause;

  // handle optional "options" param
  if (options === undefined) {
    options = {};
  }

  // init parameterized SQL query
  sql = 'DELETE FROM `' + this.collection.table + '`';
  params = [];

  // check if selector exists (null denotes selector absense)
  if (selector !== undefined && selector !== null) {
    clause = this._compileWhereClause(selector);

    sql += ' WHERE ' + clause.sql;
    params.push.apply(params, clause.params);
  }

  // check if order option exists
  if (options.order !== undefined && options.order !== null) {
    clause = this._compileOrderClause(options.order);

    sql += ' ORDER BY ' + clause;
  }

  // check if limit option exists
  if (options.limit !== undefined && options.limit !== null) {
    clause = this._compileLimitClause(options.limit);

    sql += ' LIMIT ' + clause;
  }

  sql += ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a SQL upsert statement.
 * @param {Array<Object>|Object} attrs the record attributes to create/update in the collection.
 * @param {Object} [options]
 * @returns {Object}
 * @throws {Error} if parameters are invalid
 */
QueryBuilder.prototype.compileUpsertSQL = function (attrs, options) {
  var sql, params, keys;

  // validate "attrs" param
  if (_.isPlainObject(attrs)) {
    attrs = [attrs]; // convert to array

  } else if (!_.isArray(attrs)) {
    throw new Error('Invalid attributes param - expected Object or Array<Object>, got ' + typeof(attrs));

  } else if (attrs.length === 0) {
    throw new Error('Attributes array cannot be empty');
  }

  // handle optional "options" param
  if (options === undefined) {
    options = {};
  }

  // init parameterized SQL query
  sql = 'INSERT INTO `' + this.collection.table + '`';
  params = [];

  // extract column names
  keys = Object.keys(attrs[0]); // assuming all objects in attrs have the same property

  // check if column names exist in collection
  keys.forEach(function (k) {
    if (!this.collection.hasColumn(k)) {
      throw new Error('Column "' + k + '" cannot not be found in table "' + this.collection.table + '"');
    }
  }, this);

  // append column names to SQL
  sql += ' (' +
    keys.map(function (k) {
      return this._escape(k);
    }, this).join(', ') +
    ')';

  // append values to SQL
  sql += ' VALUES ' +
    attrs.map(function(obj) {
      return '(' +
        keys.map(function (k) {
          params.push(obj[k]);
          return '?';
        }).join(', ') +
      ')';
    }).join(', ');

  // append the on duplicate key clause ...
  sql += ' ON DUPLICATE KEY UPDATE ' +
    _.difference(keys, this.collection.primaryKey)
    .map(function (k) {
      k = this._escape(k);
      return k + ' = VALUES(' + k + ')';
    }, this).join(', ');

  sql += ';';

  return {sql: sql, params: params};
};

module.exports = QueryBuilder;
