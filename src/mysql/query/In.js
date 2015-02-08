var _ = require('lodash');
var type = require('type-of');

function In($in) {
  if (_.isArray($in)) {
    if (_.isEmpty($in)) throw new Error('Invalid $in argument; array cannot be empty');
    this._arr = $in;
  } else {
    throw new Error('Invalid $in argument; expected array, received ' + type($in));
  }
}

In.prototype.toParamSQL = function () {
  var params = [];
  var sql;

  sql = this._arr
    .map(function (e) {
      params.push(e);
      return '?';
    })
    .join(', ');

  sql = 'IN (' + sql + ')';

  return {sql: sql, params: params};
};

module.exports = In;
