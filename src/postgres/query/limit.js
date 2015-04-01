var _ = require('lodash');
var type = require('type-of');

module.exports = function ($limit) {
  // handle optional $limit argument
  if (_.isUndefined($limit)) return {sql: '', params: []}; // exit

  // make sure $limit is number
  if (!_.isNumber($limit)) {
    throw new Error('Invalid $limit argument; expected number, received ' + type($limit));
  }

  // make sure $limit is positive integer
  if ($limit % 1 !== 0 || $limit < 1) {
    throw new Error('Invalid $limit argument; expected positive integer, i.e. greater than 0');
  }

  return {sql: $limit.toString(), params: []};
};
