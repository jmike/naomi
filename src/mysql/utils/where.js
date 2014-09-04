var _ = require('lodash'),
  operators = require('../operators.json'),
  escapeSQL = require('./escapeSQL');

/**
 * Compiles and returns a parameterized SQL where clause, based on the given selector.
 * @param {(object|Array.<object>)} selector
 * @returns {object} with two properties: "sql" and "params".
 * @static
 */
module.exports = function (selector) {
  var sql = 'WHERE ',
    params = [];

  // make sure selector is array
  if (!_.isArray(selector)) selector = [selector];

  sql += selector.map(function (obj) {

    return Object.keys(obj).map(function (k) {
      var expr = obj[k],
        column = escapeSQL(k),
        operator,
        value;

      _.forOwn(expr, function (v, o) {
        operator = operators[o]; // convert to sql equivalent operator
        value = v;
        return false; // exit
      });

      if (value === null && operator === '=') return column + ' IS NULL';
      if (value === null && operator === '!=') return column + ' IS NOT NULL';

      params.push(value);
      return column + ' ' + operator + ' ?';

    }).join(' AND ');

  }).join(' OR ');

  return {sql: sql, params: params};
}
