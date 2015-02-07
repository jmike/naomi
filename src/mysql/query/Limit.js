var _ = require('lodash');
var type = require('type-of');

function Limit(value) {
  this.value = (value !== undefined) ? value : null;
}

Limit.fromQuery = function (query) {
  var $limit;

  // make sure query is Object
  if (!_.isPlainObject(query)) return new Limit();

  // unpack $limit
  $limit = query.$limit;

  // check if $limit is undefined
  if (_.isUndefined($limit)) return new Limit();

  // check if $limit is positive int
  if (_.isNumber($limit)) {
    if ($limit % 1 !== 0 || $limit < 1) {
      throw new Error('Invalid $limit argument; expected positive integer, i.e. greater than 0');
    }

    return new Limit($limit);
  }

  // everything else is unacceptable
  throw new Error('Invalid $limit argument; expected number, received ' + type($limit));
};

module.exports = Limit;
