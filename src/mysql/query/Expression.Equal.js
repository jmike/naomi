var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function Equal($eq) {
    var tp = type($eq);

    if (
      tp === 'null' ||
      tp === 'object' ||
      tp === 'number' ||
      tp === 'string' ||
      tp === 'boolean' ||
      tp === 'date' ||
      Buffer.isBuffer($eq)
    ) {
      this._v = $eq;

    } else {
      throw new Error(
        'Invalid $eq expression; ' +
        'expected number, string, boolean, date, buffer, object or null, received ' + tp
      );
    }
  }

  Equal.prototype.toParamSQL = function (table) {
    var expr, query;

    if (_.isNull(this._v)) {
      return {
        sql: 'IS NULL',
        params: []
      };
    }

    if (_.isObject(this._v)) {
      expr = new Expression(this._v);
      query = expr.toParamSQL(table);

      return {
        sql: ['=', query.sql].join(' '),
        params: query.params
      };
    }

    return {
      sql: ['=', '?'].join(' '),
      params: [this._v]
    };
  };

  return Equal;

};
