var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($gt, table) {
    var sql, params, result;

    if (
      _.isNumber($gt) ||
      _.isString($gt) ||
      _.isBoolean($gt) ||
      _.isDate($gt) ||
      Buffer.isBuffer($gt)
    ) {
      sql = ['>', '?'].join(' ');
      params = [$gt];

    } else if (_.isPlainObject($gt)) {
      result = expression($gt, table);
      sql = ['>', result.sql].join(' ');
      params = result.params;

    } else {
      throw new Error(
        'Invalid $gt expression; ' +
        'expected number, string, boolean, date, buffer or object, received ' + type($gt)
      );
    }

    return {sql: sql, params: params};
  };

};
