var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function GreaterThan($gt) {
    if (
      _.isPlainObject($gt) ||
      _.isNumber($gt) ||
      _.isString($gt) ||
      _.isBoolean($gt) ||
      _.isDate($gt) ||
      Buffer.isBuffer($gt)
    ) {
      this._v = $gt;

    } else {
      throw new Error(
        'Invalid $gt expression; ' +
        'expected number, string, boolean, date, buffer or object, received ' + type($gt)
      );
    }
  }

  GreaterThan.prototype.toParamSQL = function (table) {
    var expr, query;

    if (_.isPlainObject(this._v)) {
      expr = new Expression(this._v);
      query = expr.toParamSQL(table);

      return {
        sql: ['>', query.sql].join(' '),
        params: query.params
      };
    }

    return {
      sql: ['>', '?'].join(' '),
      params: [this._v]
    };
  };

  return GreaterThan;

};
