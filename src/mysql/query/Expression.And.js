var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($and, table) {
    var sql, params = [];

    if (!_.isArray($and)) {
      throw new Error('Invalid $and expression; expected array, received ' + type($and));
    }

    if ($and.length === 0) {
      throw new Error('Invalid $and expression; array cannot be empty');
    }

    sql = $and
      .map(function (e) {
        var result = expression(e, table);
        params = params.concat(result.params);
        return result.sql;
      })
      .join(' AND ');

    sql = '(' + sql + ')';

    return {sql: sql, params: params};
  };

};
