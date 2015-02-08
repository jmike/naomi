var _ = require('lodash');
var type = require('type-of');

function LessThan($lt) {
  if (
    _.isNumber($lt) ||
    _.isString($lt) ||
    _.isBoolean($lt) ||
    _.isDate($lt) ||
    Buffer.isBuffer($lt)
  ) {
    this._v = $lt;
  } else {
    throw new Error(
      'Invalid $lt argument; ' +
      'expected number or string or boolean or date or buffer, received ' + type($lt)
    );
  }
}

LessThan.prototype.toParamSQL = function () {
  var sql = [];
  var params = [];

  sql.push('<', '?');
  params.push(this._v);

  return {sql: sql.join(' '), params: params};
};

module.exports = LessThan;
