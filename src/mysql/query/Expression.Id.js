var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');

module.exports = function (expression) {

  return function ($id, table) {
    var sql = [];
    var params, result;

    if (table.primaryKey.length !== 1) {
      throw new Error('Invalid $id argument; primary key is compound or non existent');
    }

    sql.push(escape(table.primaryKey[0]));

    if (
      _.isNull($id) ||
      _.isNumber($id) ||
      _.isString($id) ||
      _.isBoolean($id) ||
      _.isDate($id) ||
      Buffer.isBuffer($id)
    ) {
      result = expression({$eq: $id}, table);
      sql.push(result.sql);
      params = result.params;

    } else if (_.isPlainObject($id)) {
      result = expression($id, table);
      sql.push(result.sql);
      params = result.params;

    } else {
      throw new Error(
        'Invalid $id expression; ' +
        'expected number, string, boolean, date, buffer, object or null, received ' + type($id)
      );
    }

    return {sql: sql.join(' '), params: params};
  };

};
