var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($nlike, table) {
    var sql, params, result;

    if (_.isString($nlike)) {
      sql = ['NOT LIKE', '?'].join(' ');
      params = [$nlike];

    } else if (_.isPlainObject($nlike)) {
      result = expression($nlike, table);
      sql = ['NOT LIKE', result.sql].join(' ');
      params = result.params;

    } else {
      throw new Error('Invalid $nlike expression; expected object or string, received ' + type($nlike));
    }

    return {sql: sql, params: params};
  };

};
