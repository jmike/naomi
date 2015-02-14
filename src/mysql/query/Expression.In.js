var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function In($in) {
    var tp = type($in);

    if (tp === 'array') {
      if ($in.length === 0) {
        throw new Error('Invalid $in argument; array cannot be empty');
      }
      this._arr = $in;

    } else {
      throw new Error('Invalid $in argument; expected array, received ' + tp);
    }
  }

  In.prototype.toParamSQL = function (table) {
    var params = [];
    var sql;

    sql = this._arr
      .map(function (e) {
        var expr, query;

        if (_.isObject(e)) {
          expr = new Expression(e);
          query = expr.toParamSQL(table);
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

  return In;

};
