var _ = require('lodash');
var type = require('type-of');

exports.parse = function ($orderby) {
  // handle optional $orderby argument
  if (_.isUndefined($orderby)) {
    $orderby = [];
  }

  // validate $orderby argument
  if (!_.isArray($orderby)) {
    throw new Error('Invalid $orderby argument; expected array, received ' + type($orderby));
  }

  // ensure $orderby elements are valid
  $orderby = $orderby
    .map(function (e) {
      var obj, keys, value;

      if (_.isString(e)) {
        obj = {};
        obj[e] = 1;

        return obj;
      }

      if (_.isObject(e)) {
        keys = Object.keys(e);
        if (keys.length === 0) throw new Error('Invalid $orderby element; object must not be empty');
        if (keys.length > 1) throw new Error('Invalid $orderby element; object must contain exactly one property');

        value = e[keys[0]];
        if (value !== 1 && value !== -1) throw new Error('Invalid $orderby element; value must be either -1 or 1');

        return e;
      }

      throw new Error('Invalid $orderby element; expected object or string, received ' + type(e));
    });

  return $orderby;
};

exports.visit = function (results, $orderby) {
  results.$orderby = exports.parse($orderby);
};
