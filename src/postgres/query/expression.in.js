var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($in, table) {
    var sql, params = [];

    if (!_.isArray($in)) {
      throw new Error('Invalid $in expression; expected array, received ' + type($in));
    }

    if ($in.length === 0) {
      throw new Error('Invalid $in expression; array cannot be empty');
    }

    sql = $in
      .map(function (e) {
        var query;

        if (_.isPlainObject(e)) {
          query = expression(e, table);
          params = params.concat(query.params);
          return query.sql;
        }

        params.push(e);
        return '?';
      })
      .join(', ');

    sql = 'IN (' + sql + ')';

    return {sql: sql, params: params};
  };

};
