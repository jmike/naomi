var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');

function OrderBy($orderby) {
  if (_.isUndefined($orderby)) {
    this.value = [];

  } else if (_.isArray($orderby)) {
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

    this.value = $orderby;

  } else { // everything else is unacceptable
    throw new Error('Invalid $orderby argument; expected array, received ' + type($orderby));
  }
}

OrderBy.prototype.toParamSQL = function (table) {
  var sql;

  // check if value array is empty
  if (_.isEmpty(this.value)) return null;

  // build SQL
  sql = this.value
    .map(function (e) {
      var k = Object.keys(e)[0];
      var v = e[k];

      // make sure column exists in table
      if (!table.hasColumn(k))  {
        throw new Error('Unknown column "' + k + '"; not found in table "' + table.name + '"');
      }

      return escape(k) + ' ' + (v === 1 ? 'ASC' : 'DESC');
    })
    .join(', ');

  return {sql: sql, params: []};
};

OrderBy.fromQuery = function (query) {
  if (!_.isPlainObject(query)) return new OrderBy();
  return new OrderBy(query.$orderby);
};

module.exports = OrderBy;
