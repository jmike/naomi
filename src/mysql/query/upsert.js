var _ = require('lodash');
var type = require('type-of');
var values = require('./values');
var columns = require('./columns');
var escape = require('./escape');

function updateColumns($updateColumns) {
  var sql;

  if (!_.isArray($updateColumns)) {
    throw new Error('Invalid $updateColumns argument; expected array, received ' + type($updateColumns));
  }

  sql = $updateColumns
    .map(function (column) {
      column = escape(column);
      return column + ' = VALUES(' + column + ')';
    })
    .join(', ');

  return {sql: sql, params: []};
}

module.exports = function ($query, table) {
  var sql = [];
  var params = [];

  // handle optional $query argument
  if (_.isUndefined($query)) $query = {};

  // make sure $query argument is valid
  if (!_.isPlainObject($query)) {
    throw new Error('Invalid $query parameter; expected object, received ' + type($query));
  }

  var _values = values($query.$values, table);
  var _columns = columns($query.$columns || _values.keys, table);
  var _updateColumns = updateColumns($query.$updateColumns || _.difference(_values.keys, table.primaryKey), table);

  sql.push('INSERT');

  if (_updateColumns.sql === '') sql.push('IGNORE');

  sql.push('INTO', escape(table.name));

  if (_columns.sql !== '') {
    sql.push('(' + _columns.sql + ')');
    params = params.concat(_columns.params);
  }

  sql.push('VALUES', _values.sql);
  params = params.concat(_values.params);

  if (_updateColumns.sql !== '') {
    sql.push('ON DUPLICATE KEY UPDATE', _updateColumns.sql);
    params = params.concat(_updateColumns.params);
  }

  return {sql: sql.join(' ') + ';', params: params};
};
