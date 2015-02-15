var _ = require('lodash');
var type = require('type-of');

module.exports = function (Expression) {

  function Equal($eq) {
    if (
      _.isNull($eq) ||
      _.isPlainObject($eq) ||
      _.isNumber($eq) ||
      _.isString($eq) ||
      _.isBoolean($eq) ||
      _.isDate($eq) ||
      Buffer.isBuffer($eq)
    ) {
      this._v = $eq;

    } else {
      throw new Error(
        'Invalid $eq expression; ' +
        'expected number, string, boolean, date, buffer, object or null, received ' + type($eq)
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

    if (_.isPlainObject(this._v)) {
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
