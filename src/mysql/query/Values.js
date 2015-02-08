var _ = require('lodash');
var type = require('type-of');

function Values($values) {
  if (_.isUndefined($values)) {
    this.arr = null;

  } else if (_.isPlainObject($values)) {
    if (_.isEmpty($values)) throw new Error('Invalid $values argument; object cannot be empty');
    this.arr = [$values];

  } else if (_.isArray($values)) {
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

    this.arr = $values;

  } else { // everything else is unacceptable
    throw new Error('Invalid $values argument; expected object or Array, received ' + type($values));
  }
}

Values.prototype.toParamSQL = function (table) {
  var sql = [];
  var params = [];
  var columns;

  // check if internal array is null
  if (this.arr === null) return null;

  // extract column names
  columns = Object.keys(this.arr[0]);

  // make sure columns actually exist
  columns.forEach(function (column) {
    if (!table.hasColumn(column))  {
      throw new Error('Unknown column "' + column + '"; not found in table "' + table.name + '"');
    }
  });

  // generate SQL + params
  sql = this.arr
    .map(function (e) {
      var group = columns
        .map(function (k) {
          params.push(e[k]);
          return '?';
        })
        .join(', ');

      return '(' + group + ')';
    })
    .join(', ');

  return {sql: sql, params: params};
};

module.exports = Values;
