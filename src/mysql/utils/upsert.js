var escapeSQL = require('./escapeSQL');

/**
 * Compiles and returns a parameterized UPSERT statement.
 * @param {object} options query properties.
 * @param {string} options.table
 * @param {object} options.values values to upsert.
 * @param {Array.<string>} [options.updateColumns] columns to update if record already exists - defaults to all columns.
 * @param {Array.<object>} [options.updateSelector] selector to search if records exists.
 * @return {object} with "sql" and "params" properties.
 * @static
 */
module.exports = function (options) {
  var sql = [],
    params = [],
    columns;

  columns = Object.keys(options.values);
  options.updateColumns = options.updateColumns || columns;

  sql.push('INSERT INTO ' + escapeSQL(options.table));

  sql.push('(' + columns.map(function (column) {
    return escapeSQL(column);
  }).join(', ') + ')');

  sql.push('VALUES');

  sql.push('(' + columns.map(function (k) {
    params.push(options.values[k]);
    return '?';
  }).join(', ') + ')');

  sql.push('ON DUPLICATE KEY UPDATE');

  sql.push(options.updateColumns.map(function (column) {
    column = escapeSQL(column);
    return column + ' = VALUES(' + column + ')';
  }).join(', '));

  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};
