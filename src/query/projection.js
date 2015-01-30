var _ = require('lodash');
var type = require('type-of');

exports.parse = function ($projection) {
  var $include = [];
  var $exclude = [];

  // handle optional $projection argument
  if (_.isUndefined($projection)) {
    $projection = {};
  }

  // validate $projection argument
  if (!_.isPlainObject($projection)) {
    throw new Error('Invalid $projection argument; expected object, received ' + type($projection));
  }

  // separate exclusive from inclusive columns
  _.forOwn($projection, function (v, k) {
    if (v === 1) {
      $include.push(k);
    } else if (v === 0 || v === -1) {
      $exclude.push(k);
    }
  });

  return {$include: $include, $exclude: $exclude};
};

exports.visit = function (results, $projection) {
  results.$projection = exports.parse($projection);
};
