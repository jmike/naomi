var _ = require('lodash');
var type = require('type-of');

function GreaterThanOrEqual($gte) {
  if (
    _.isNumber($gte) ||
    _.isString($gte) ||
    _.isBoolean($gte) ||
    _.isDate($gte) ||
    Buffer.isBuffer($gte)
  ) {
    this._v = $gte;
  } else {
    throw new Error(
      'Invalid $gte argument; ' +
      'expected number or string or boolean or date or buffer, received ' + type($gte)
    );
  }
}

GreaterThanOrEqual.prototype.toParamSQL = function () {
  var sql = [];
  var params = [];

  sql.push('>=', '?');
  params.push(this._v);

  return {sql: sql.join(' '), params: params};
};

module.exports = GreaterThanOrEqual;
