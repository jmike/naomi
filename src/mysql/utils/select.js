var escapeSQL = require('./escapeSQL'),
  where = require('./where'),
  orderBy = require('./orderBy');

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
module.exports = function (options) {
  var sql = [],
    params = [],
    clause;

  sql.push('SELECT');

  if (options.columns) {
    sql.push(options.columns.map(function (column) {
      return escapeSQL(column);
    }).join(', '));

  } else {
    sql.push('*');
  }

  sql.push('FROM ' + escapeSQL(options.table));

  if (options.selector) {
    clause = where(options.selector);

    sql.push(clause.sql);
    params.push.apply(params, clause.params);
  }

  if (options.order) {
    sql.push(orderBy(options.order));
  }

  if (options.limit) {
    sql.push('LIMIT ' + options.limit);

    if (options.offset) {
      sql.push('OFFSET ' + options.offset);
    }
  }

  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};
