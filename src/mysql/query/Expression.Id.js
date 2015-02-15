var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');

module.exports = function (Expression) {

  function Id($id) {
    if (
      _.isNull($id) ||
      _.isPlainObject($id) ||
      _.isNumber($id) ||
      _.isString($id) ||
      _.isBoolean($id) ||
      _.isDate($id) ||
      Buffer.isBuffer($id)
    ) {
      this._v = $id;

    } else {
      throw new Error(
        'Invalid $id expression; ' +
        'expected number, string, boolean, date, buffer, object or null, received ' + type($id)
      );
    }
  }

  Id.prototype.toParamSQL = function (table) {
    var sql = [];
    var params, expr, query;

    if (table.primaryKey.length !== 1) {
      throw new Error('Invalid $id argument; primary key is compound or non existent');
    }

    sql.push(escape(table.primaryKey[0]));

    if (_.isPlainObject(this._v)) {
      expr = new Expression(this._v);
      query = expr.toParamSQL(table);
    } else {
      expr = new Expression({$eq: this._v});
      query = expr.toParamSQL(table);
    }

    sql.push(query.sql);
    params = query.params;

    return {sql: sql.join(' '), params: params};
  };

  return Id;

};
