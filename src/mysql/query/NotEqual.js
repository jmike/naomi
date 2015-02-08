var _ = require('lodash');
var type = require('type-of');

function NotEqual($ne) {
  if (
    _.isNull($ne) ||
    _.isNumber($ne) ||
    _.isString($ne) ||
    _.isBoolean($ne) ||
    _.isDate($ne) ||
    Buffer.isBuffer($ne)
  ) {
    this._v = $ne;
  } else {
    throw new Error(
      'Invalid $ne argument; ' +
      'expected number or string or boolean or date or buffer or null, received ' + type($ne)
    );
  }
}

NotEqual.prototype.toParamSQL = function () {
  var sql = [];
  var params = [];

  if (_.isNull(this._v)) {
    sql.push('IS NOT NULL');
  } else {
    sql.push('!=', '?');
    params.push(this._v);
  }

  return {sql: sql.join(' '), params: params};
};

module.exports = NotEqual;
