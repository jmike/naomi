var _ = require('lodash');
var type = require('type-of');

function Equal($eq) {
  if (
    _.isNull($eq) ||
    _.isNumber($eq) ||
    _.isString($eq) ||
    _.isBoolean($eq) ||
    _.isDate($eq) ||
    Buffer.isBuffer($eq)
  ) {
    this._v = $eq;
  } else {
    throw new Error(
      'Invalid $eq argument; ' +
      'expected number or string or boolean or date or buffer or null, received ' + type($eq)
    );
  }
}

Equal.prototype.toParamSQL = function () {
  var sql = [];
  var params = [];

  if (_.isNull(this._v)) {
    sql.push('IS NULL');
  } else {
    sql.push('=', '?');
    params.push(this._v);
  }

  return {sql: sql.join(' '), params: params};
};

module.exports = Equal;
