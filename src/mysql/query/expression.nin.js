var _ = require('lodash');
var type = require('type-of');

module.exports = function (expression) {

  return function ($nin, table) {
    var sql, params = [];

    if (!_.isArray($nin)) {
      throw new Error('Invalid $nin expression; expected array, received ' + type($nin));
    }

    if ($nin.length === 0) {
      throw new Error('Invalid $nin expression; array cannot be empty');
    }

    sql = $nin
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

    sql = 'NOT IN (' + sql + ')';

    return {sql: sql, params: params};
  };

};
