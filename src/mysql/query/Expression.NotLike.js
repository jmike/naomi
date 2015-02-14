var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function NotLike($nlike) {
    var tp = type($nlike);

    if (tp === 'string' || tp === 'object') {
      this._v = $nlike;
    } else {
      throw new Error('Invalid $nlike expression; expected object or string, received ' + tp);
    }
  }

  NotLike.prototype.toParamSQL = function (table) {
    var expr, query;

    if (_.isObject(this._v)) {
      expr = new Expression(this._v);
      query = expr.toParamSQL(table);

      return {
        sql: ['NOT LIKE', query.sql].join(' '),
        params: query.params
      };
    }

    return {
      sql: ['NOT LIKE', '?'].join(' '),
      params: [this._v]
    };
  };

  return NotLike;

};
