var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function And($and) {
    var tp = type($and);

    if (tp === 'array') {
      if ($and.length === 0) {
        throw new Error('Invalid $and argument; array cannot be empty');
      }
      this._arr = $and;

    } else {
      throw new Error('Invalid $and argument; expected array, received ' + tp);
    }
  }

  And.prototype.toParamSQL = function (table) {
    var params = [];
    var sql;

    sql = this._arr
      .map(function (e) {
        var expr = new Expression(e);
        var query = expr.toParamSQL(table);
        params = params.concat(query.params);
        return query.sql;
      })
      .join(' AND ');

    sql = '(' + sql + ')';

    return {sql: sql, params: params};
  };

  And.fromObject = function (query) {
    if (!_.isObject(query)) return new And();
    return new And(query.$and);
  };

  return And;

};
