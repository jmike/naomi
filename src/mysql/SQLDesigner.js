var _ = require('lodash'),
  operators = require('./operators.json');

/**
 * Escapes the given column name to be used in a SQL query.
 * @param {String} column the name of the column.
 * @param {String} [table] the name of the table (optional).
 * @returns {String}
 * @private
 * @static
 */
function escape(column, table) {
  if (table) {
    return '`' + table + '`.' + column;
  }

  return '`' + column + '`';
}

/**
 * Parses the given expression, as part of a selector, and returns a parameterized SQL expression.
 * @param {Object} expr an object with a single property, where key represents the operator.
 * @returns {Object} with two properties: "sql" and "params".
 * @private
 * @static
 */
function parseExpression(expr) {
  var keys = Object.keys(expr),
    k, v, params, sql;

  if (keys.length !== 1) {
    throw new Error('Invalid expression in selector - expected an object with a single property, received an object with ' + keys.length);
  }

  k = keys[0];

  if (!operators.hasOwnProperty(k)) {
    throw new Error('Unable to parse unknown operator "' + k + '"');
  }

  k = operators[k]; // convert to sql equivalent
  v = expr[k];

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
}

/**
 * Compiles and returns a SQL where clause, based on the given selector.
 * @param Boolean|Number|String|Date|Object|Array.<Object>} selector
 * @param {Object} [options]
 * @returns {Object} with two properties: "sql" and "params".
 * @throws {Error} if selector is unspecified or invalid.
 * @private
 */
function compileWhereClause(collection, selector, options) {
  var sql = [],
    params = [],
    obj = {},
    expr;

  if (_.isPlainObject(selector)) { // standard selector type
    _.forOwn(selector, function (v, k) {
      if (!collection.hasColumn(k)) {
        throw new Error('Column "' + k + '" could not be found in table "' + collection.table + '"');
      }

      k = escape(k, options.qualify && collection.table); // qualify column name

      if (v === null) { // null value
        sql.push(k + ' IS NULL');

      } else if (_.isPlainObject(v)) { // expression specified
        expr = parseExpression(v);
        sql.push(k + ' ' + expr.sql);
        params.push.apply(params, expr.params);

      } else { // plain value
        sql.push(k + ' = ?');
        params.push(v);
      }
    });

    return {sql: sql.join(' AND '), params: params};

  } else if (_.isNumber(selector) || _.isString(selector) || _.isDate(selector) || _.isBoolean(selector)) { // plain value selector
    // is primary key compound or non existent?
    if (collection.primaryKey.length !== 1) {
      throw new Error(
        'Primary key is compound or non existent, thus Boolean, Number, String and Date selectors are useless'
      );
    }

    obj[collection.primaryKey[0]] = selector;
    return compileWhereClause(collection, obj, options);

  } else if (_.isArray(selector)) { // array of selectors
    selector.forEach(function (selector) {
      var result = compileWhereClause(collection, selector, options);
      sql.push(result.sql);
      params.push.apply(params, result.params);
    });

    return {sql: sql.join(' OR '), params: params};

  } else {
    throw new Error('Unexpected type of selector: ' + typeof(selector));
  }
}

/**
 * Compiles and returns a SQL order clause, based on the given order expression.
 * @param {String|Object|Array<Object>} order the order expression, e.g. 'name', {'name': 'desc'}, [{'name': 'desc'}, 'id'].
 * @returns {String}
 * @throws {Error} if order is unspecified or invalid.
 * @private
 * @static
 */
function compileOrderClause(collection, order, options) {
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

    if (!collection.hasColumn(k)) {
      throw new Error('Column "' + k + '" cannot be found in table "' + collection.table + '"');
    }

    if (!re.test(v)) {
      throw new Error('Value in order expression should match either "asc" or "desc"');
    }

    k = escape(k, options.qualify && collection.table); // qualify column name
    v = v.toUpperCase();

    sql.push(k + ' ' + v);

  } else if (_.isString(order)) {
    k = order;
    obj[k] = 'asc';
    sql.push(compileOrderClause(collection, obj, options));

  } else if (_.isArray(order)) {
    order.forEach(function (e) {
      sql.push(compileOrderClause(collection, e, options));
    });

  } else {
    throw new Error('Unexpected type of order: ' + typeof(order));
  }

  return sql.join(', ');
}


/**
 * Compiles and returns a SQL limit clause, based on the given limit.
 * @param {String|Number} limit a String or a Number representing a positive integer, e.g. '10' or 2.
 * @returns {Number}
 * @throws {Error} if limit is unspecified or invalid.
 * @private
 */
function compileLimitClause(limit) {
  var n = parseInt(limit, 10);

  if (n % 1 !== 0 || n < 1) {
    throw new Error('Invalid limit expression - expecting a String or Number representing a positive integer');
  }

  return n;
}


/**
 * Compiles and returns a SQL offset clause, based on the given offset.
 * @param {String|Number} offset a String or a Number representing a non-negative integer, e.g. '10' or 2.
 * @returns {Number}
 * @throws {Error} if offset is unspecified or invalid.
 * @private
 */
function compileOffsetClause(offset) {
  var n = parseInt(offset, 10);

  if (n % 1 !== 0 || n < 0) {
    throw new Error('Invalid offset expression - expecting a String or Number representing a non-negative integer');
  }

  return n;
}

/**
 * Compiles and returns a SQL select statement.
 * @param {Collection} collection the collection to run the SQL statement against.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>|Null} selector a selector to match the record(s) in the collection.
 * @param {Object} [options]
 * @returns {Object}
 * @throws {Error} if parameters are invalid
 * @public
 * @static
 */
exports.compileSelectSQL = function (collection, selector, options) {
  var sql, params, clause;

  // handle optional "options" param
  if (options === undefined) {
    options = {};
  }

  // init parameterized SQL query
  sql = 'SELECT * FROM `' + collection.table + '`';
  params = [];

  // check if selector exists (null denotes selector absense)
  if (selector !== undefined && selector !== null) {
    clause = compileWhereClause(collection, selector, options);

    sql += ' WHERE ' + clause.sql;
    params.push.apply(params, clause.params);
  }

  // check if order option exists
  if (options.order !== undefined && options.order !== null) {
    clause = compileOrderClause(collection, options.order, options);

    sql += ' ORDER BY ' + clause;
  }

  // check if limit option exists
  if (options.limit !== undefined && options.limit !== null) {
    clause = compileLimitClause(options.limit);

    sql += ' LIMIT ' + clause;
  }

  // check if offset option exists
  if (options.offset !== undefined && options.offset !== null) {
    clause = compileOffsetClause(options.offset);

    sql += ' OFFSET ' + clause;
  }

  sql += ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a SQL count statement.
 * @param {Collection} collection the collection to run the SQL statement against.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>|Null} selector a selector to match the record(s) in the collection.
 * @param {Object} [options]
 * @returns {Object}
 * @throws {Error} if parameters are invalid
 * @public
 * @static
 */
exports.compileCountSQL = function (collection, selector, options) {
  var sql, params, clause;

  // handle optional "options" param
  if (options === undefined) {
    options = {};
  }

  // init parameterized SQL query
  sql = 'SELECT COUNT(*) AS `count` FROM `' + collection.table + '`';
  params = [];

  // check if selector exists (null denotes selector absense)
  if (selector !== undefined && selector !== null) {
    clause = compileWhereClause(collection, selector, options);

    sql += ' WHERE ' + clause.sql;
    params.push.apply(params, clause.params);
  }

  // check if order option exists
  if (options.order !== undefined && options.order !== null) {
    clause = compileOrderClause(collection, options.order, options);

    sql += ' ORDER BY ' + clause;
  }

  // check if limit option exists
  if (options.limit !== undefined && options.limit !== null) {
    clause = compileLimitClause(options.limit);

    sql += ' LIMIT ' + clause;
  }

  // check if offset option exists
  if (options.offset !== undefined && options.offset !== null) {
    clause = compileOffsetClause(options.offset);

    sql += ' OFFSET ' + clause;
  }

  sql += ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a SQL delete statement.
 * @param {Collection} collection the collection to run the SQL statement against.
 * @param {Boolean|Number|String|Date|Object|Array.<Object>|Null} selector a selector to match the record(s) in the collection.
 * @param {Object} [options]
 * @returns {Object}
 * @throws {Error} if parameters are invalid
 * @public
 * @static
 */
exports.compileDeleteSQL = function (collection, selector, options) {
  var sql, params, clause;

  // handle optional "options" param
  if (options === undefined) {
    options = {};
  }

  // init parameterized SQL query
  sql = 'DELETE FROM `' + collection.table + '`';
  params = [];

  // check if selector exists (null denotes selector absense)
  if (selector !== undefined && selector !== null) {
    clause = compileWhereClause(collection, selector, options);

    sql += ' WHERE ' + clause.sql;
    params.push.apply(params, clause.params);
  }

  // check if order option exists
  if (options.order !== undefined && options.order !== null) {
    clause = compileOrderClause(collection, options.order, options);

    sql += ' ORDER BY ' + clause;
  }

  // check if limit option exists
  if (options.limit !== undefined && options.limit !== null) {
    clause = compileLimitClause(options.limit);

    sql += ' LIMIT ' + clause;
  }

  sql += ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a SQL upsert statement.
 * @param {Collection} collection the collection to run the SQL statement against.
 * @param {Array<Object>|Object} attrs the record attributes to create/update in the collection.
 * @param {Object} [options]
 * @returns {Object}
 * @throws {Error} if parameters are invalid
 * @public
 * @static
 */
exports.compileUpsertSQL = function (collection, attrs, options) {
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
  sql = 'INSERT INTO `' + collection.table + '`';
  params = [];

  // extract column names
  keys = Object.keys(attrs[0]); // assuming all objects in attrs have the same property

  // check if column names exist in collection
  keys.forEach(function (k) {
    if (!collection.hasColumn(k)) {
      throw new Error('Column "' + k + '" cannot not be found in table "' + collection.table + '"');
    }
  });

  // append column names to SQL
  sql += ' (' + Object.keys(attrs[0]).map(function (k) {
    return escape(k, options.qualified && collection.table);
  }).join(', ') + ')';

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
    _.difference(keys, collection.primaryKey)
    .map(function (k) {
      k = escape(k, options.qualified && collection.table);
      return k + ' = VALUES(' + k + ')';
    }).join(', ');

  sql += ';';

  return {sql: sql, params: params};
};
