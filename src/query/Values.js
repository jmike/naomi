var _ = require('lodash');
var type = require('type-of');

function Values(value) {
  this.value = (value !== undefined) ? value : null;
}

exports.fromQuery = function ($values) {
  // check if $values is undefined
  if (_.isUndefined($values)) return new Values();

  // check if $values is Object
  if (_.isPlainObject($values)) {
    if (_.isEmpty($values)) throw new Error('Invalid $values argument; object cannot be empty');
    return new Values([$values]);
  }

  // check if $values is Array
  if (_.isArray($values)) {
    if (_.isEmpty($values)) throw new Error('Invalid $values argument; array cannot be empty');

    // validate array elements
    $values = $values.map(function (e, i) {
      if (!_.isPlainObject(e)) {
        throw new Error('Invalid $values element at position ' + i + '; expected object, received ' + type(e));
      }

      if (_.isEmpty(e)) {
        throw new Error('Invalid $values element at position ' + i + '; object cannot be empty');
      }

      return e;
    });

    return new Values($values);
  }

  // everything else is unacceptable
  throw new Error('Invalid $values argument; expected object or Array, received ' + type($values));
};

module.export = Values;
