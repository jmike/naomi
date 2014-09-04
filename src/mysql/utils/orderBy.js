var _ = require('lodash'),
  escapeSQL = require('./escapeSQL');

/**
 * Compiles and returns a SQL order clause, based on the given order.
 * @param {(object|Array.<object>)} order
 * @returns {string}
 * @static
 */
module.exports = function (order) {
  var sql = 'ORDER BY ';

  if (!_.isArray(order)) order = [order];

  sql += order.map(function (obj) {
    var column, type;

    _.forOwn(obj, function (v, k) {
      column = escapeSQL(k);
      type =  v.toUpperCase();
      return false; // exit
    });

    return column + ' ' + type;
  }).join(', ');

  return sql;
};
