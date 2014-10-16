var fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  Handlebars = require('handlebars').create(),
  operators = require('./operators.json'),
  selectTemplate, countTemplate, deleteTemplate, insertTemplate, upsertTemplate;

/**
 * Escapes the given identifier to use safely in a SQL query.
 * @param {string} identifier
 * @returns {string}
 * @private
 * @static
 */
function escapeSQL(identifier) {
  return '"' + identifier + '"';
}

/**
 * Compiles and returns the designated handlebars template.
 * @param {string} name the template name, e.g. "select".
 * @return {Handlebars.template}
 * @static
 * @private
 */
function compileTemplate(name) {
  var file, source;

  file = path.resolve(__dirname, '../templates/pg.' + name + '.hbs');
  source = fs.readFileSync(file, {encoding: 'utf8'});

  return Handlebars.compile(source, {noEscape: true});
}

// register handlebars helpers
Handlebars.registerHelper('escape', function(identifier) {
  return new Handlebars.SafeString(escapeSQL(identifier));
});

// compile template(s)
selectTemplate = compileTemplate('select');
countTemplate = compileTemplate('count');
deleteTemplate = compileTemplate('delete');
insertTemplate = compileTemplate('insert');
upsertTemplate = compileTemplate('upsert');

/**
 * Compiles and returns a column SQL expression to use in a SELECT query, based on the supplied columns array.
 * @param {Array<string>} columns an array of column names.
 * @return {string}
 * @private
 * @static
 */
function compileSelectColumns(columns) {
  if (_.isArray(columns)) {
    return columns.map(function (column) {
      return escapeSQL(column);
    }).join(', ');
  }

  return '*';
}

/**
 * Compiles and returns a parameterized SQL where clause based on the given selector.
 * @param {(object|Array.<object>)} selector
 * @returns {object} with two properties: "sql" and "params".
 * @static
 */
function compileWhereClause(selector) {
  var params = [], sql;

  // make sure selector is array
  if (!_.isArray(selector)) selector = [selector];

  sql = selector.map(function (obj) {

    return Object.keys(obj).map(function (k) {
      var expr = obj[k],
        columnName = escapeSQL(k),
        operator,
        value;

      _.forOwn(expr, function (v, o) {
        operator = operators[o]; // convert to sql equivalent operator
        value = v;
        return false; // exit
      });

      if (value === null && operator === '=') return columnName + ' IS NULL';
      if (value === null && operator === '!=') return columnName + ' IS NOT NULL';

      params.push(value);
      return columnName + ' ' + operator + ' ?';

    }).join(' AND ');

  }).join(' OR ');

  return {sql: sql, params: params};
}

/**
 * Compiles and returns a SQL order clause based on the given order.
 * @param {(object|Array.<object>)} order
 * @returns {string}
 * @static
 */
function compileOrderByClause(order) {
  // make sure order is array
  if (!_.isArray(order)) order = [order];

  return order.map(function (obj) {
    var columnName, type;

    _.forOwn(obj, function (v, k) {
      columnName = escapeSQL(k);
      type =  v.toUpperCase();
      return false; // exit
    });

    return columnName + ' ' + type;

  }).join(', ');
}

/**
 * Compiles and returns a parameterized value SQL expression to use in an INSERT query, based on the given keys and tuples.
 * @param {Array.<string>} keys the array of keys.
 * @param {(object|Array.<object>)} tuples values mapped with keys.
 * @returns {object} with two properties: "sql" and "params".
 * @static
 * @private
 */
function compileInsertValues(keys, tuples) {
  var params = [], sql;

  // make sure tuples is array
  if (!_.isArray(tuples)) tuples = [tuples];

  sql = tuples.map(function (tuple) {

    return '(' + keys.map(function (key) {
      params.push(tuple[key]);
      return '?';
    }).join(', ') + ')';

  }).join(', ');

  return {sql: sql, params: params};
}

/**
 * Compiles and returns an expression to use in an UPDATE query, based on the given keys and tuples.
 * @param {Array.<string>} keys the array of keys.
 * @param {object} tuple values mapped with keys.
 * @returns {object} with two properties: "sql" and "params".
 * @returns {string}
 * @static
 * @private
 */
function compileUpdateAssignments(keys, tuple) {
  var params = [], sql;

  sql = keys.map(function (k) {
    params.push(tuple[k]);
    return escapeSQL(k) + ' = ?';
  }).join(', ');

  return {sql: sql, params: params};
}

/**
 * Compiles and returns a parameterized SELECT query.
 * @param {object} options query options.
 * @param {string} options.table the name of the table to select records from.
 * @param {Array.<string>} [options.columns] the name of the columns to select.
 * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {(object|Array.<object>)} [options.order] an order expression to sort records.
 * @param {number} [options.limit] max number of records to return from table - must be a positive integer, i.e. limit > 0.
 * @param {number} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
 * @returns {object} with "sql" and "params" properties.
 * @static
 *
 * @example output format:
 * {
 *   sql: 'SELECT name FROM table WHERE id = ?;',
 *   params: [1],
 * }
 */
function compileSelectQuery(options) {
  var sql, params, where, orderBy;

  where = options.selector && compileWhereClause(options.selector);
  orderBy = options.order && compileOrderByClause(options.order);
  params = where && where.params || [];

  sql = selectTemplate({
    columns: compileSelectColumns(options.columns),
    table: options.table,
    where: where && where.sql,
    orderBy: orderBy,
    limit: options.limit,
    offset: options.offset
  }).replace(/\s+/g, ' ').replace(/\s+$/, ';');

  return {sql: sql, params: params};
}

/**
 * Compiles and returns a parameterized SELECT COUNT query.
 * @param {object} options query properties.
 * @param {string} options.table the name of the table to count records from.
 * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {number} [options.limit] max number of records to return from table - must be a positive integer, i.e. limit > 0.
 * @param {number} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
 * @return {object} with "sql" and "params" properties.
 * @static
 */
function compileCountQuery(options) {
  var sql, params, where, orderBy;

  where = options.selector && compileWhereClause(options.selector);
  orderBy = options.order && compileOrderByClause(options.order);
  params = where && where.params || [];

  sql = countTemplate({
    table: options.table,
    where: where && where.sql,
    orderBy: orderBy,
    limit: options.limit,
    offset: options.offset
  }).replace(/\s+/g, ' ').replace(/\s+$/, ';');

  return {sql: sql, params: params};
}

/**
 * Compiles and returns a parameterized INSERT statement.
 * @param {object} options query properties.
 * @param {string} options.table the table name to insert data.
 * @param {Array.<string>} options.columns the columns of the record to insert.
 * @param {(object|Array.<object>)} options.values values to insert if no record is found.
 * @param {Array.<string>} [options.returnColumns] the columns to return after upsert.
 * @return {object} with "sql" and "params" properties.
 * @static
 */
function compileInsertQuery(options) {
  var sql, params, values;

  values = compileInsertValues(options.columns, options.values);
  params = values.params;

  sql = insertTemplate({
    table: options.table,
    columns: compileSelectColumns(options.columns),
    values: values.sql,
    returning: compileSelectColumns(options.returnColumns)
  }).replace(/\s+/g, ' ').replace(/\s+$/, ';');

  return {sql: sql, params: params};
}

/**
 * Compiles and returns a parameterized DELETE statement.
 * @param {object} options query properties.
 * @param {string} options.table the name of the table to delete records from.
 * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
 * @param {(object|Array.<object>)} [options.order] an order expression to sort records.
 * @param {number} [options.limit] max number of records to delete from database - must be a positive integer, i.e. limit > 0.
 * @return {object} with "sql" and "params" properties.
 * @static
 */
function compileDeleteQuery(options) {
  var sql, params, where, orderBy;

  where = options.selector && compileWhereClause(options.selector);
  orderBy = options.order && compileOrderByClause(options.order);
  params = where && where.params || [];

  sql = deleteTemplate({
    table: options.table,
    where: where && where.sql,
    orderBy: orderBy,
    limit: options.limit
  }).replace(/\s+/g, ' ').replace(/\s+$/, ';');

  return {sql: sql, params: params};
}

/**
 * Compiles and returns a parameterized UPSERT statement.
 * @param {object} options query properties.
 * @param {string} options.table the table to upsert data into.
 * @param {object} options.values the record values.
 * @param {Array.<string>} options.columns the columns of the record to insert.
 * @param {Array.<string>} options.updateColumns the columns of the record to update.
 * @param {Array.<Array.<string>>} options.identifier
 * @param {Array.<string>} [options.returnColumns] the columns to return after upsert.
 * @return {object} with "sql" and "params" properties.
 * @static
 */
function compileUpsertQuery(options) {
  var sql, params, assignments, where, values;

  assignments = compileUpdateAssignments(options.updateColumns, options.values);
  params = assignments.params;

  where = options.identifier.map(function (keys) {
    return keys.map(function (k) {
      params.push(options.values[k]);
      return escapeSQL(k) + ' = ?';
    }).join(' AND ');
  }).join(' OR ');

  values = options.columns.map(function (k) {
    params.push(options.values[k]);
    return '?';
  }).join(', ');

  sql = upsertTemplate({
    table: options.table,
    columns: compileSelectColumns(options.columns),
    values: values,
    assignments: assignments.sql,
    where: where,
    returning: compileSelectColumns(options.returnColumns)
  }).replace(/\s+/g, ' ').replace(/\(\s/g, '(').replace(/\s\)/g, ')').replace(/\s+$/, ';');

  return {sql: sql, params: params};

  // init with UPDATE statement
// WITH
//   new_data (id, value) AS (
//     VALUES (1, 2), (3, 4), ...
//   ),
//   updated AS (
//     UPDATE table t set
//       value = t.value + new_data.value
//     FROM new_data
//     WHERE t.id = new_data.id
//     RETURNING t.*
//   ),
//   inserted as (
//   INSERT INTO table (id, value)
//   SELECT id, value
//   FROM new_data
//   WHERE NOT EXISTS (
//     SELECT 1 FROM updated WHERE updated.id = new_data.id
//   )
//   RETURNING id, value)
// SELECT id, value
// FROM inserted
// UNION ALL
// SELECT id, value
// FROM updated
}

exports.select = compileSelectQuery;
exports.insert = compileInsertQuery;
exports.upsert = compileUpsertQuery;
exports.del = compileDeleteQuery;
exports.count = compileCountQuery;
exports.where = compileWhereClause;
exports.orderBy = compileOrderByClause;
