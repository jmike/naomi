var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($like, table) {
    var sql, params, result;

    if (_.isString($like)) {
      sql = ['LIKE', '?'].join(' ');
      params = [$like];

    } else if (_.isPlainObject($like)) {
      result = expression($like, table);
      sql = ['LIKE', result.sql].join(' ');
      params = result.params;

    } else {
      throw new Error('Invalid $like expression; expected object or string, received ' + type($like));
    }

    return {sql: sql, params: params};
  };

};
