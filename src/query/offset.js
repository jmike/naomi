var _ = require('lodash');
var type = require('type-of');

exports.parse = function ($offset) {
  if (_.isUndefined($offset)) return null;

  if (_.isNumber($offset)) {
    if ($offset % 1 !== 0 || $offset < 0) {
      throw new Error('Invalid $offset argument; expected non-negative integer');
    }
    return $offset;
  }

  throw new Error('Invalid $offset argument; expected number, received ' + type($offset));
};

exports.visit = function (results, $offset) {
  results.$offset = exports.parse($offset);
};
