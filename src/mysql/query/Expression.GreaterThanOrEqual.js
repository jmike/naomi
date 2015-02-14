var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function GreaterThanOrEqual($gte) {
    var tp = type($gte);

    if (
      tp === 'object' ||
      tp === 'number' ||
      tp === 'string' ||
      tp === 'boolean' ||
      tp === 'date' ||
      Buffer.isBuffer($gte)
    ) {
      this._v = $gte;

    } else {
      throw new Error(
        'Invalid $gte expression; ' +
        'expected number, string, boolean, date, buffer or object, received ' + tp
      );
    }
  }

  GreaterThanOrEqual.prototype.toParamSQL = function (table) {
    var expr, query;

    if (_.isObject(this._v)) {
      expr = new Expression(this._v);
      query = expr.toParamSQL(table);

      return {
        sql: ['>=', query.sql].join(' '),
        params: query.params
      };
    }

    return {
      sql: ['>=', '?'].join(' '),
      params: [this._v]
    };
  };

  return GreaterThanOrEqual;

};
