var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($eq, table) {
    var sql, params, result;

    if (
      _.isNumber($eq) ||
      _.isString($eq) ||
      _.isBoolean($eq) ||
      _.isDate($eq) ||
      Buffer.isBuffer($eq)
    ) {
      sql = ['=', '?'].join(' ');
      params = [$eq];

    } else if (_.isNull($eq)) {
      sql = 'IS NULL';
      params = [];

    } else if (_.isPlainObject($eq)) {
      result = expression($eq, table);
      sql = ['=', result.sql].join(' ');
      params = result.params;

    } else {
      throw new Error(
        'Invalid $eq expression; ' +
        'expected number, string, boolean, date, buffer, object or null, received ' + type($eq)
      );
    }

    return {sql: sql, params: params};
  };

};
