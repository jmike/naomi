var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function NotEqual($ne) {
    var tp = type($ne);

    if (
      tp === 'null' ||
      tp === 'object' ||
      tp === 'number' ||
      tp === 'string' ||
      tp === 'boolean' ||
      tp === 'date' ||
      Buffer.isBuffer($ne)
    ) {
      this._v = $ne;

    } else {
      throw new Error(
        'Invalid $ne expression; ' +
        'expected number, string, boolean, date, buffer, object or null, received ' + tp
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

    if (_.isObject(this._v)) {
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
