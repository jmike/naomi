var escapeSQL = require('./escapeSQL'),
  where = require('./where');

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
module.exports = function (options) {
  var sql = [],
    params = [],
    clause;

  sql.push('SELECT COUNT(*) AS `count`');

  sql.push('FROM ' + escapeSQL(options.table));

  if (options.selector) {
    clause = where(options.selector);

    sql.push(clause.sql);
    params.push.apply(params, clause.params);
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
