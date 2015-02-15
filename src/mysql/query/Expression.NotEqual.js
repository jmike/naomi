var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function NotEqual($ne) {
    if (
      _.isNull($ne) ||
      _.isPlainObject($ne) ||
      _.isNumber($ne) ||
      _.isString($ne) ||
      _.isBoolean($ne) ||
      _.isDate($ne) ||
      Buffer.isBuffer($ne)
    ) {
      this._v = $ne;

    } else {
      throw new Error(
        'Invalid $ne expression; ' +
        'expected number, string, boolean, date, buffer, object or null, received ' + type($ne)
      );
    }
  }

  NotEqual.prototype.toParamSQL = function (table) {
    var expr, query;

    if (_.isNull(this._v)) {
      return {
        sql: 'IS NOT NULL',
        params: []
      };
    }

    if (_.isPlainObject(this._v)) {
      expr = new Expression(this._v);
      query = expr.toParamSQL(table);

      return {
        sql: ['!=', query.sql].join(' '),
        params: query.params
      };
    }

    return {
      sql: ['!=', '?'].join(' '),
      params: [this._v]
    };
  };

  return NotEqual;

};
