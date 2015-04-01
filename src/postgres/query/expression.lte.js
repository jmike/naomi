var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($lte, table) {
    var sql, params, result;

    if (
      _.isNumber($lte) ||
      _.isString($lte) ||
      _.isBoolean($lte) ||
      _.isDate($lte) ||
      Buffer.isBuffer($lte)
    ) {
      sql = ['<=', '?'].join(' ');
      params = [$lte];

    } else if (_.isPlainObject($lte)) {
      result = expression($lte, table);
      sql = ['<=', result.sql].join(' ');
      params = result.params;

    } else {
      throw new Error(
        'Invalid $lte expression; ' +
        'expected number, string, boolean, date, buffer or object, received ' + type($lte)
      );
    }

    return {sql: sql, params: params};
  };

};
