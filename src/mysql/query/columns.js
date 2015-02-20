var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');

module.exports = function ($columns, table) {
  var params = [];
  var sql;

  // handle optional $columns argument
  if (_.isUndefined($columns)) $columns = [];

  // make sure $columns is valid
  if (!_.isArray($columns)) {
    throw new Error('Invalid $columns argument; expected object or Array, received ' + type($columns));
  }

  // generate SQL + params
  sql = $columns
    .map(function (e) {
      if (!table.hasColumn(e))  {
        throw new Error('Unknown column "' + e + '"; not found in table "' + table.name + '"');
      }
      return escape(e);
    })
    .join(', ');

  return {sql: sql, params: params};
};
