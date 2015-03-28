var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($ne, table) {
    var sql, params, result;

    if (
      _.isNumber($ne) ||
      _.isString($ne) ||
      _.isBoolean($ne) ||
      _.isDate($ne) ||
      Buffer.isBuffer($ne)
    ) {
      sql = ['!=', '?'].join(' ');
      params = [$ne];

    } else if (_.isNull($ne)) {
      sql = 'IS NOT NULL';
      params = [];

    } else if (_.isPlainObject($ne)) {
      result = expression($ne, table);
      sql = ['!=', result.sql].join(' ');
      params = result.params;

    } else {
      throw new Error(
        'Invalid $ne expression; ' +
        'expected number, string, boolean, date, buffer, object or null, received ' + type($ne)
      );
    }

    return {sql: sql, params: params};
  };

};
