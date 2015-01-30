var _ = require('lodash');
var type = require('type-of');

exports.parse = function ($limit) {
  if (_.isUndefined($limit)) return null;

  if (_.isNumber($limit)) {
    if ($limit % 1 !== 0 || $limit < 1) {
      throw new Error('Invalid $limit argument; expected positive integer');
    }
    return $limit;
  }

  throw new Error('Invalid $limit argument; expected number, received ' + type($limit));
};

exports.visit = function (results, $limit) {
  results.$limit = exports.parse($limit);
};
