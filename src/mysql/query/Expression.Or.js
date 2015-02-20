var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($or, table) {
    var sql, params = [];

    if (!_.isArray($or)) {
      throw new Error('Invalid $or expression; expected array, received ' + type($or));
    }

    if ($or.length === 0) {
      throw new Error('Invalid $or expression; array cannot be empty');
    }

    sql = $or
      .map(function (e) {
        var result = expression(e, table);
        params = params.concat(result.params);
        return result.sql;
      })
      .join(' OR ');

    sql = '(' + sql + ')';

    return {sql: sql, params: params};
  };

};
