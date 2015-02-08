var _ = require('lodash');
var type = require('type-of');

function Limit($limit) {
  if (_.isUndefined($limit)) {
    this.value = null;

  } else if (_.isNumber($limit)) {
    if ($limit % 1 !== 0 || $limit < 1) {
      throw new Error('Invalid $limit argument; expected positive integer, i.e. greater than 0');
    }
    this.value = $limit;

  } else { // everything else is unacceptable
    throw new Error('Invalid $limit argument; expected number, received ' + type($limit));
  }
}

Limit.prototype.toParamSQL = function () {
  if (this.value === null) return null;
  return {sql: this.value.toString(), params: []};
};

Limit.fromQuery = function (query) {
  if (!_.isPlainObject(query)) return new Limit();
  return new Limit(query.$limit);
};

module.exports = Limit;
