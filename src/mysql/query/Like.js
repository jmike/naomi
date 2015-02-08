var _ = require('lodash');
var type = require('type-of');

function Like($like) {
  if (_.isString($like)) {
    this._v = $like;
  } else {
    throw new Error('Invalid $like argument; expected string, received ' + type($like));
  }
}

Like.prototype.toParamSQL = function () {
  var sql = [];
  var params = [];

  sql.push('LIKE', '?');
  params.push(this._v);

  return {sql: sql.join(' '), params: params};
};

module.exports = Like;
