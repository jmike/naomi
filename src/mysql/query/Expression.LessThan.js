var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function LessThan($lt) {
    if (
      _.isPlainObject($lt) ||
      _.isNumber($lt) ||
      _.isString($lt) ||
      _.isBoolean($lt) ||
      _.isDate($lt) ||
      Buffer.isBuffer($lt)
    ) {
      this._v = $lt;

    } else {
      throw new Error(
        'Invalid $lt expression; ' +
        'expected number, string, boolean, date, buffer or object, received ' + type($lt)
      );
    }
  }

  LessThan.prototype.toParamSQL = function (table) {
    var expr, query;

    if (_.isPlainObject(this._v)) {
      expr = new Expression(this._v);
      query = expr.toParamSQL(table);

      return {
        sql: ['<', query.sql].join(' '),
        params: query.params
      };
    }

    return {
      sql: ['<', '?'].join(' '),
      params: [this._v]
    };
  };

  return LessThan;

};
