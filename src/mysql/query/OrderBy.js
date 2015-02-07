var _ = require('lodash');
var type = require('type-of');

function OrderBy(value) {
  this.value = (value !== undefined) ? value : [];
}

OrderBy.fromQuery = function (query) {
  var $orderby;

  // make sure query is Object
  if (!_.isPlainObject(query)) return new OrderBy();

  // unpack $orderby
  $orderby = query.$orderby;

  // check if $orderby is undefined
  if (_.isUndefined($orderby)) $orderby = [];

  // check if $orderby is array
  if (_.isArray($orderby)) {
    // validate array elements
    $orderby = $orderby.map(function (e, i) {
      var obj, keys, value;

      // check if element is String
      if (_.isString(e)) {
        obj = {};
        obj[e] = 1; // default is ASC

        return obj;
      }

      // check if element is Object
      if (_.isObject(e)) {
        keys = Object.keys(e);

        if (keys.length === 0) {
          throw new Error('Invalid $orderby element at position ' + i + '; object cannot be empty');
        }

        if (keys.length > 1) {
          throw new Error('Invalid $orderby element at position ' + i + '; object must contain exactly one property');
        }

        value = e[keys[0]];
        if (value !== 1 && value !== -1) {
          throw new Error('Invalid $orderby element at position ' + i + '; value must be either -1 or 1');
        }

        return e;
      }

      // everything else is unacceptable
      throw new Error('Invalid $orderby element at position ' + i + '; expected object or string, received ' + type(e));
    });

    return new OrderBy($orderby);
  }

  // everything else is unacceptable
  throw new Error('Invalid $orderby argument; expected array, received ' + type($orderby));
};

module.exports = OrderBy;
