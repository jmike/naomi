var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function NotIn($nin) {
    var tp = type($nin);

    if (tp === 'array') {
      if ($nin.length === 0) {
        throw new Error('Invalid $nin argument; array cannot be empty');
      }
      this._arr = $nin;

    } else {
      throw new Error('Invalid $nin argument; expected array, received ' + tp);
    }
  }

  NotIn.prototype.toParamSQL = function (table) {
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

    sql = 'NOT IN (' + sql + ')';

    return {sql: sql, params: params};
  };

  return NotIn;

};
