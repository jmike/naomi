var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function NotLike($nlike) {
    if (_.isString($nlike) || _.isPlainObject($nlike)) {
      this._v = $nlike;

    } else {
      throw new Error('Invalid $nlike expression; expected object or string, received ' + type($nlike));
    }
  }

  NotLike.prototype.toParamSQL = function (table) {
    var expr, query;

    if (_.isPlainObject(this._v)) {
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
