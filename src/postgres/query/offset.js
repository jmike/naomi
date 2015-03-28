var _ = require('lodash');
var type = require('type-of');

module.exports = function ($offset) {
  // handle optional $offset argument
  if (_.isUndefined($offset)) return {sql: '', params: []}; // exit

  // make sure $offset is number
  if (!_.isNumber($offset)) {
    throw new Error('Invalid $offset argument; expected number, received ' + type($offset));
  }

  // make sure $offset is positive integer
  if ($offset % 1 !== 0 || $offset < 0) {
    throw new Error('Invalid $offset argument; expected non-negative integer, i.e. greater than or equal to 0');
  }

  return {sql: $offset.toString(), params: []};
};
