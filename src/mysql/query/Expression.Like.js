var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function Like($like) {
    var tp = type($like);

    if (tp === 'string' || tp === 'object') {
      this._v = $like;
    } else {
      throw new Error('Invalid $like expression; expected object or string, received ' + tp);
    }
  }

  Like.prototype.toParamSQL = function (table) {
    var expr, query;

    if (_.isObject(this._v)) {
      expr = new Expression(this._v);
      query = expr.toParamSQL(table);

      return {
        sql: ['LIKE', query.sql].join(' '),
        params: query.params
      };
    }

    return {
      sql: ['LIKE', '?'].join(' '),
      params: [this._v]
    };
  };

  return Like;

};
