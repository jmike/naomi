var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');

module.exports = function (Expression) {

  function Id($id) {
    var tp = type($id);

    if (
      tp === 'null' ||
      tp === 'object' ||
      tp === 'number' ||
      tp === 'string' ||
      tp === 'boolean' ||
      tp === 'date' ||
      Buffer.isBuffer($id)
    ) {
      this._v = $id;

    } else {
      throw new Error(
        'Invalid $id expression; ' +
        'expected number, string, boolean, date, buffer, object or null, received ' + tp
      );
    }
  }

  Id.prototype.toParamSQL = function (table) {
    var sql = [];
    var params, expr, query;

    if (table.primaryKey.length !== 1) {
      throw new Error(
        'Invalid $id argument; ' +
        'primary key is compound or non existent'
      );
    }

    sql.push(escape(table.primaryKey[0]));

    if (_.isObject(this._v)) {
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
