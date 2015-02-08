var _ = require('lodash');
var type = require('type-of');

function NotLike($nlike) {
  if (_.isString($nlike)) {
    this._v = $nlike;
  } else {
    throw new Error('Invalid $nlike argument; expected string, received ' + type($nlike));
  }
}

NotLike.prototype.toParamSQL = function () {
  var sql = [];
  var params = [];

  sql.push('NOT LIKE', '?');
  params.push(this._v);

  return {sql: sql.join(' '), params: params};
};

module.exports = NotLike;
