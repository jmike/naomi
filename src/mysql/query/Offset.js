var _ = require('lodash');
var type = require('type-of');

function Offset(value) {
  this.value = (value !== undefined) ? value : null;
}

Offset.fromQuery = function (query) {
  var $offset;

  // make sure query is Object
  if (!_.isPlainObject(query)) return new Offset();

  // unpack $offset
  $offset = query.$offset;

  // check if $offset is undefined
  if (_.isUndefined($offset)) return new Offset();

  // check if $offset is non-negative integer
  if (_.isNumber($offset)) {
    if ($offset % 1 !== 0 || $offset < 0) {
      throw new Error('Invalid $offset argument; expected non-negative integer, i.e. >= 0');
    }

    return new Offset($offset);
  }

  // everything else is unacceptable
  throw new Error('Invalid $offset argument; expected number, received ' + type($offset));
};

module.exports = Offset;
