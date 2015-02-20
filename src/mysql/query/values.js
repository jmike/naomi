var _ = require('lodash');
var type = require('type-of');

module.exports = function ($values, table) {
  var params = [];
  var sql;
  var columns;

  // handle optional $values argument
  if (_.isUndefined($values)) $values = [{}];

  // convert $values object -> array
  if (_.isPlainObject($values)) $values = [$values];

  // make sure $values is valid
  if (!_.isArray($values)) {
    throw new Error('Invalid $values argument; expected object or Array, received ' + type($values));
  }

  // make sure $values elements are valid
  $values.forEach(function (e, i) {
    if (!_.isPlainObject(e)) {
      throw new Error('Invalid $values element at position ' + i + '; expected object, received ' + type(e));
    }
  });

  // extract column names
  columns = Object.keys($values[0]);

  // make sure columns actually exist
  columns.forEach(function (column) {
    if (!table.hasColumn(column))  {
      throw new Error('Unknown column "' + column + '"; not found in table "' + table.name + '"');
    }
  });

  // generate SQL + params
  sql = $values
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
