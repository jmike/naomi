var _ = require('lodash');
var type = require('type-of');
var values = require('./values');
var columns = require('./columns');
var escape = require('./escape');

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
  var _ignore = ($query.$ignore === true);

  sql.push('INSERT');

  if (_ignore) sql.push('IGNORE');

  sql.push('INTO', escape(table.name));

  if (_columns.sql !== '') {
    sql.push('(' + _columns.sql + ')');
    params = params.concat(_columns.params);
  }

  sql.push('VALUES', _values.sql);
  params = params.concat(_values.params);

  return {sql: sql.join(' ') + ';', params: params};
};
