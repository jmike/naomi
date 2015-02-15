var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function Or($or) {
    if (_.isArray($or)) {
      if ($or.length === 0) {
        throw new Error('Invalid $or expression; array cannot be empty');
      }
      this._arr = $or;

    } else {
      throw new Error('Invalid $or expression; expected array, received ' + type($or));
    }
  }

  Or.prototype.toParamSQL = function (table) {
    var params = [];
    var sql;

    sql = this._arr
      .map(function (e) {
        var expr = new Expression(e);
        var query = expr.toParamSQL(table);
        params = params.concat(query.params);
        return query.sql;
      })
      .join(' OR ');

    sql = '(' + sql + ')';

    return {sql: sql, params: params};
  };

  Or.fromObject = function (query) {
    if (!_.isObject(query)) return new Or();
    return new Or(query.$or);
  };

  return Or;

};
