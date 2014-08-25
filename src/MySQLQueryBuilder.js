var _ = require('lodash'),
  operators = require('./mysql-operators.json');

/**
 * Escapes the given string to use safely in a SQL query.
 * @param {string} str
 * @returns {string}
 * @static
 */
function escapeSQL(str) {
  return '`' + str + '`';
}

/**
 * Compiles and returns a SQL order clause, based on the given input.
 * @param {Array.<object>} input
 * @returns {string}
 * @static
 */
function orderBy(input) {
  var sql = 'ORDER BY ';

  sql += input.map(function (obj) {
    var column, type;

    _.forOwn(obj, function (v, k) {
      column = escapeSQL(k);
      type =  v.toUpperCase();
      return false; // exit
    });

    return column + ' ' + type;
  }).join(', ');

  return sql;
}

/**
 * Compiles and returns a parameterized SQL where clause, based on the given input.
 * @param {Array.<object>} input
 * @returns {object} with two properties: "sql" and "params".
 * @static
 */
function where(input) {
  var sql = 'WHERE ',
    params = [];

  sql += input.map(function (obj) {
    return Object.keys(obj).map(function (k) {
      var expr = obj[k],
        column, operator, value;

      column = escapeSQL(k);

      _.forOwn(expr, function (v, o) {
        operator = operators[o]; // convert to sql equivalent operator
        value = v;
        return false; // exit
      });

      if (value === null && operator === '=') {
        return column + ' IS NULL';
      }

      if (value === null && operator === '!=') {
        return column + ' IS NOT NULL';
      }

      params.push(value);
      return column + ' ' + operator + ' ?';

    }).join(' AND ');

  }).join(' OR ');

  return {sql: sql, params: params};
}

/**
 * Compiles and returns a parameterized SELECT query.
 * @param {object} options query properties.
 * @param {string} options.table
 * @param {(Array.<string>|null)} [options.columns]
 * @param {(Array.<object>|null)} [options.where]
 * @param {(Array.<object>|null)} [options.orderBy]
 * @param {(number|null)} [options.limit]
 * @param {(number|null)} [options.offset]
 * @returns {object} with "sql" and "params" properties.
 * @throws {Error} If options is invalid or undefined.
 * @static
 *
 * @example output format:
 * {
 *   sql: 'SELECT name FROM table WHERE id = ?;',
 *   params: [1],
 * }
 */
exports.select = function (options) {
  var sql = [], params = [], clause;

  // validate "options" param
  if (!_.isPlainObject(options)) {
    throw new Error('Invalid SELECT query options, expected plain object, received ' + typeof(options));
  }

  // init statement
  sql.push('SELECT');

  // set columns
  if (options.columns) {
    sql.push(
      options.columns.map(function (column) {
        return escapeSQL(column);
      }).join(', ')
    );

  } else {
    sql.push('*');
  }

  // set FROM clause
  sql.push('FROM ' + escapeSQL(options.table));

  // set WHERE clause
  if (options.where) {
    clause = where(options.where);

    sql.push(clause.sql);
    params.push.apply(params, clause.params);
  }

  // set ORDER BY clause
  if (options.orderBy) {
    clause = orderBy(options.orderBy);
    sql.push(clause);
  }

  // set LIMIT clause
  if (options.limit) {
    sql.push('LIMIT ' + options.limit);
  }

  // set OFFSET clause
  if (options.offset != null) {
    sql.push('OFFSET ' + options.offset);
  }

  // finish it
  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a parameterized SELECT COUNT query.
 * @param {object} options query properties.
 * @param {string} options.table
 * @param {(Array.<object>|null)} [options.where]
 * @param {(number|null)} [options.limit]
 * @param {(number|null)} [options.offset]
 * @return {object} with "sql" and "params" properties.
 * @throws {Error} If options is invalid or undefined.
 * @static
 */
exports.count = function (options) {
  var sql = [], params = [], clause;

  // validate "options" param
  if (!_.isPlainObject(options)) {
    throw new Error('Invalid SELECT COUNT query options, expected plain object, received ' + typeof(options));
  }

  // init statement
  sql.push('SELECT COUNT(*) AS `count`');

  // set FROM clause
  sql.push('FROM ' + escapeSQL(options.table));

  // set WHERE clause
  if (options.where) {
    clause = where(options.where);

    sql.push(clause.sql);
    params.push.apply(params, clause.params);
  }

  // set LIMIT clause
  if (options.limit) {
    sql.push('LIMIT ' + options.limit);
  }

  // set OFFSET clause
  if (options.offset) {
    sql.push('OFFSET ' + options.offset);
  }

  // finish it
  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a parameterized DELETE statement.
 * @param {object} options query properties.
 * @param {string} options.table
 * @param {(Array.<object>|null)} [options.where]
 * @param {(Array.<object>|null)} [options.orderBy]
 * @param {(number|null)} [options.limit]
 * @return {object} with "sql" and "params" properties.
 * @throws {Error} If options is invalid or undefined.
 * @static
 */
exports.delete = function (options) {
  var sql = [], params = [], clause;

  // validate "options" param
  if (!_.isPlainObject(options)) {
    throw new Error('Invalid DELETE query options, expected plain object, received ' + typeof(options));
  }

  // init DELETE statement
  sql.push('DELETE');

  // set FROM clause
  sql.push('FROM ' + escapeSQL(options.table));

  // set WHERE clause
  if (options.where) {
    clause = where(options.where);

    sql.push(clause.sql);
    params.push.apply(params, clause.params);
  }

  // set ORDER BY clause
  if (options.orderBy) {
    clause = orderBy(options.orderBy);
    sql.push(clause);
  }

  // set LIMIT clause
  if (options.limit) {
    sql.push('LIMIT ' + options.limit);
  }

  // finish it
  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a parameterized UPSERT statement.
 * @param {object} options query properties.
 * @param {string} options.table the table to upsert data.
 * @param {object} options.values values to insert if no record is found.
 * @param {Array.<string>} [options.updateColumns] the record columns to update if record already exists - defaults to all columns.
 * @return {object} with "sql" and "params" properties.
 * @throws {Error} If options is invalid or undefined.
 * @static
 */
exports.upsert = function (options) {
  var sql = [], params = [], columns;

  // validate "options" param
  if (!_.isPlainObject(options)) {
    throw new Error('Invalid UPSERT query options, expected plain object, received ' + typeof(options));
  }

  columns = Object.keys(options.values);
  options.updateColumns = options.updateColumns || columns;

  // init statement
  sql.push('INSERT INTO ' + escapeSQL(options.table));

  // set INSERT columns
  sql.push('(' + columns.map(function (column) {
    return escapeSQL(column);
  }).join(', ') + ')');

  // set VALUES
  sql.push('VALUES');

  sql.push('(' + columns.map(function (k) {
    params.push(options.values[k]);
    return '?';
  }).join(', ') + ')');

  // set UPDATE columns
  sql.push('ON DUPLICATE KEY UPDATE');

  sql.push(options.updateColumns.map(function (column) {
    column = escapeSQL(column);
    return column + ' = VALUES(' + column + ')';
  }).join(', '));

  // finish it
  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a parameterized INSERT statement.
 * @param {object} options query properties.
 * @param {string} options.table the table to upsert data.
 * @param {object} options.values values to insert if no record is found.
 * @return {object} with "sql" and "params" properties.
 * @throws {Error} If options is invalid or undefined.
 * @static
 */
exports.insert = function (options) {
  var sql = [], params = [], columns;

  // validate "options" param
  if (!_.isPlainObject(options)) {
    throw new Error('Invalid INSERT query options, expected plain object, received ' + typeof(options));
  }

  columns = Object.keys(options.values);

  // init statement
  sql.push('INSERT INTO ' + escapeSQL(options.table));

  // set VALUES
  sql.push('SET');

  sql.push(
    columns.map(function (k) {
      params.push(options.values[k]);
      return escapeSQL(k) + ' = ?';
    }).join(', ')
  );

  // finish it
  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a BEGIN TRANSACTION statement.
 * @return {string}
 * @static
 */
exports.beginTransaction = function () {
  return 'START TRANSACTION;';
};

/**
 * Compiles and returns a COMMIT TRANSACTION statement.
 * @return {string}
 * @static
 */
exports.commitTransaction = function () {
  return 'COMMIT;';
};
