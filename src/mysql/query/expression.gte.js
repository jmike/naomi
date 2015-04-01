var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($gte, table) {
    var sql, params, result;

    if (
      _.isNumber($gte) ||
      _.isString($gte) ||
      _.isBoolean($gte) ||
      _.isDate($gte) ||
      Buffer.isBuffer($gte)
    ) {
      sql = ['>=', '?'].join(' ');
      params = [$gte];

    } else if (_.isPlainObject($gte)) {
      result = expression($gte, table);
      sql = ['>=', result.sql].join(' ');
      params = result.params;

    } else {
      throw new Error(
        'Invalid $gte expression; ' +
        'expected number, string, boolean, date, buffer or object, received ' + type($gte)
      );
    }

    return {sql: sql, params: params};
  };

};
