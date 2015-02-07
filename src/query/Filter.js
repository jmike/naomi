var _ = require('lodash');
var type = require('type-of');

function Filter(value) {
  this.value = (value !== undefined) ? value : null;
}

/**
 * Parses the designated query and returns a new Filter.
 * @param {(Boolean|Number|String|Date|Object|Array.<Object>)} query
 * @return {Filter}
 */
Filter.fromQuery = function (query) {
  var $filter;
  var keys;

  // check if query is undefined
  if (_.isUndefined(query)) return new Filter();

  // check if query is array
  if (_.isArray(query)) {
    return new Filter({$or: query});
  }

  // check if query is plain value
  if (_.isNumber(query) || _.isString(query) || _.isBoolean(query) || _.isDate(query) || Buffer.isBuffer(query)) {
    return new Filter({$primarykey: query});
  }

  // check if query is object
  if (_.isPlainObject(query)) {
    // unpack $filter
    $filter = _.omit(query, [
      '$projection',
      '$orderby',
      '$limit',
      '$offset',
      '$values',
      '$skip',
      '$sort'
    ]);

    keys = Object.keys($filter);
    if (keys.length > 1) {
      return new Filter({
        $and: keys.map(function (k) {
          var obj = {};
          obj[k] = $filter[k];
          return obj;
        })
      });
    }

    return new Filter($filter);
  }

  // everything else is unacceptable
  throw new Error('Invalid $query argument; expected plain value or array or object, received ' + type(query));
};

module.exports = Filter;
