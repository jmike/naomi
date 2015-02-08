var _ = require('lodash');
var type = require('type-of');

function GreaterThan($gt) {
  if (
    _.isNumber($gt) ||
    _.isString($gt) ||
    _.isBoolean($gt) ||
    _.isDate($gt) ||
    Buffer.isBuffer($gt)
  ) {
    this._v = $gt;
  } else {
    throw new Error(
      'Invalid $gt argument; ' +
      'expected number or string or boolean or date or buffer, received ' + type($gt)
    );
  }
}

GreaterThan.prototype.toParamSQL = function () {
  var sql = [];
  var params = [];

  sql.push('<', '?');
  params.push(this._v);

  return {sql: sql.join(' '), params: params};
};

module.exports = GreaterThan;
