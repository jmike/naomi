var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($lt, table) {
    var sql, params, result;

    if (
      _.isNumber($lt) ||
      _.isString($lt) ||
      _.isBoolean($lt) ||
      _.isDate($lt) ||
      Buffer.isBuffer($lt)
    ) {
      sql = ['<', '?'].join(' ');
      params = [$lt];

    } else if (_.isPlainObject($lt)) {
      result = expression($lt, table);
      sql = ['<', result.sql].join(' ');
      params = result.params;

    } else {
      throw new Error(
        'Invalid $lt expression; ' +
        'expected number, string, boolean, date, buffer or object, received ' + type($lt)
      );
    }

    return {sql: sql, params: params};
  };

};
