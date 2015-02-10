var _ = require('lodash');
var type = require('type-of');

function Limit($limit) {
  if (_.isUndefined($limit)) {
    this._v = null;

  } else if (_.isNumber($limit)) {
    if ($limit % 1 !== 0 || $limit < 1) {
      throw new Error('Invalid $limit argument; expected positive integer, i.e. greater than 0');
    }
    this._v = $limit;

  } else { // everything else is unacceptable
    throw new Error('Invalid $limit argument; expected number, received ' + type($limit));
  }
}

Limit.prototype.toParamSQL = function () {
  if (this._v === null) return null;
  return {sql: this._v.toString(), params: []};
};

Limit.fromObject = function (query) {
  if (!_.isPlainObject(query)) return new Limit();
  return new Limit(query.$limit);
};

module.exports = Limit;
