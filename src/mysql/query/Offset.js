var _ = require('lodash');
var type = require('type-of');

function Offset($offset) {
  if (_.isUndefined($offset)) {
    this.value = null;

  } else if (_.isNumber($offset)) {
    if ($offset % 1 !== 0 || $offset < 0) {
      throw new Error('Invalid $offset argument; expected non-negative integer, i.e. >= 0');
    }
    this.value = $offset;

  } else { // everything else is unacceptable
    throw new Error('Invalid $offset argument; expected number, received ' + type($offset));
  }
}

Offset.prototype.toParamSQL = function () {
  if (this.value === null) return null;
  return {sql: this.value.toString(), params: []};
};

Offset.fromQuery = function (query) {
  if (!_.isPlainObject(query)) return new Offset();
  return new Offset(query.$offset);
};

module.exports = Offset;
