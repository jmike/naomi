var _ = require('lodash');
var type = require('type-of');

exports.parse = function ($values) {
  // check if $values is undefined
  if (_.isUndefined($values)) return null;

  // check if $values is object
  if (_.isPlainObject($values)) {
    if (_.isEmpty($values)) {
      throw new Error('Invalid $values argument; object cannot be empty');
    }
    // convert to array
    return [$values];
  }

  // check if $values is array
  if (_.isArray($values)) {
    if (_.isEmpty($values)) {
      throw new Error('Invalid $values argument; array cannot be empty');
    }
    // make sure array contents are valid
    $values.forEach(function (e) {
      if (!_.isPlainObject(e)) throw new Error('Invalid $values element; array must only contain Objects');
      if (_.isEmpty(e)) throw new Error('Invalid $values element; object cannot be empty');
    });
    // return as-is
    return $values;
  }

  throw new Error('Invalid $values argument; expected Object or Array, received ' + type($values));
};

exports.visit = function (results, $values) {
  results.$values = exports.parse($values);
};
