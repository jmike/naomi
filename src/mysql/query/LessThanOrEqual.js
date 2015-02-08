var _ = require('lodash');
var type = require('type-of');

function LessThanOrEqual($lte) {
  if (
    _.isNumber($lte) ||
    _.isString($lte) ||
    _.isBoolean($lte) ||
    _.isDate($lte) ||
    Buffer.isBuffer($lte)
  ) {
    this._v = $lte;
  } else {
    throw new Error(
      'Invalid $lte argument; ' +
      'expected number or string or boolean or date or buffer, received ' + type($lte)
    );
  }
}

LessThanOrEqual.prototype.toParamSQL = function () {
  var sql = [];
  var params = [];

  sql.push('<=', '?');
  params.push(this._v);

  return {sql: sql.join(' '), params: params};
};

module.exports = LessThanOrEqual;
