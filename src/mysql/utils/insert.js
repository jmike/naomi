var escapeSQL = require('./escapeSQL');

/**
 * Compiles and returns a parameterized INSERT statement.
 * @param {object} options query properties.
 * @param {string} options.table the table name to insert data.
 * @param {(object|Array.<object>)} options.values values to insert if no record is found.
 * @return {object} with "sql" and "params" properties.
 * @static
 */
module.exports = function (options) {
  var sql = [], params = [], columns;

  columns = Object.keys(options.values);

  sql.push('INSERT INTO ' + escapeSQL(options.table));

  sql.push('SET');

  sql.push(columns.map(function (k) {
    params.push(options.values[k]);
    return escapeSQL(k) + ' = ?';
  }).join(', '));

  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};
