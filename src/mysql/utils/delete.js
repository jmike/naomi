var escapeSQL = require('./escapeSQL'),
  where = require('./where'),
  orderBy = require('./orderBy');

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
module.exports = function (options) {
  var sql = [],
    params = [],
    clause;

  sql.push('DELETE');

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
  }

  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};
