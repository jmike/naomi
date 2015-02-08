var _ = require('lodash');
var type = require('type-of');

function NotIn($nin) {
  if (_.isArray($nin)) {
    if (_.isEmpty($nin)) throw new Error('Invalid $nin argument; array cannot be empty');
    this._arr = $nin;

  } else {
    throw new Error('Invalid $nin argument; expected array, received ' + type($nin));
  }
}

NotIn.prototype.toParamSQL = function () {
  var params = [];
  var sql;

  sql = this._arr
    .map(function (e) {
      params.push(e);
      return '?';
    })
    .join(', ');

  sql = 'NOT IN (' + sql + ')';

  return {sql: sql, params: params};
};

module.exports = NotIn;
