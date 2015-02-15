var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function Like($like) {
    if (_.isString($like) || _.isPlainObject($like)) {
      this._v = $like;

    } else {
      throw new Error('Invalid $like expression; expected object or string, received ' + type($like));
    }
  }

  Like.prototype.toParamSQL = function (table) {
    var expr, query;

    if (_.isPlainObject(this._v)) {
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
