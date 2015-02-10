var _ = require('lodash');
var type = require('type-of');

function Offset($offset) {
  if (_.isUndefined($offset)) {
    this._v = null;

  } else if (_.isNumber($offset)) {
    if ($offset % 1 !== 0 || $offset < 0) {
      throw new Error('Invalid $offset argument; expected non-negative integer, i.e. >= 0');
    }
    this._v = $offset;

  } else { // everything else is unacceptable
    throw new Error('Invalid $offset argument; expected number, received ' + type($offset));
  }
}

Offset.prototype.toParamSQL = function () {
  if (this._v === null) return null;
  return {sql: this._v.toString(), params: []};
};

Offset.fromObject = function (query) {
  if (!_.isPlainObject(query)) return new Offset();
  return new Offset(query.$offset);
};

module.exports = Offset;
