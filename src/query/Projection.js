var _ = require('lodash');
var type = require('type-of');

function Projection(include, exclude) {
  this.$include = (include !== undefined) ? include : [];
  this.$exclude = (exclude !== undefined) ? exclude : [];
}

exports.fromQuery = function (query) {
  var $projection;
  var $include = [];
  var $exclude = [];

  // make sure query is Object
  if (!_.isPlainObject(query)) return new Projection();

  // unpack $projection
  $projection = query.$projection;

  // check if $projection is undefined
  if (_.isUndefined($projection)) return new Projection();

  // check if $projection is Object
  if (_.isPlainObject($projection)) {
    // separate exclusive from inclusive columns
    _.forOwn($projection, function (v, k) {
      if (v === 1) {
        $include.push(k);
      } else if (v === 0 || v === -1) {
        $exclude.push(k);
      } else {
        throw new Error('Invalid property "' + k + '"; value must be either -1 or 1');
      }
    });

    return new Projection($include, $exclude);
  }

  // everything else is unacceptable
  throw new Error('Invalid $projection argument; expected object, received ' + type($projection));
};

module.export = Projection;
