var _ = require('lodash');
var Values = require('./Values');
var escape = require('./escape');

function Upsert($values) {
  this._values = new Values($values);
}

Upsert.prototype.$updateColumns = function ($updateColumns) {
  var _this = this;
  var sql;

  if (!_.isArray($updateColumns)) {
    throw new Error('Invalid value for $updateColumns expression; expected array, received ' + type($updateColumns));
  }

  if ($updateColumns.length === 0) return null;

  sql = $updateColumns
    .map(function (column) {
      column = _this.escape(column);
      return column + ' = VALUES(' + column + ')';
    })
    .join(', ');

  return {sql: sql, params: []};
};

Upsert.prototype.toParamSQL = function (table) {
  var values = this._values.toParamSQL(table);
  var columns = Object.keys(values._arr[0] || table.columns);
  var updateColumns = this.$updateColumns(_.difference(columns, this.primaryKey));
  var projection = this.$projection({$include: columns});

  var sql = [];
  var params = [];

  sql.push('INSERT');

  if (updateColumns === null) {
    sql.push('IGNORE');
  }

  sql.push('INTO', table, '(' + projection + ')');

  sql.push('VALUES', values.sql);
  params = params.concat(values.params);

  if (updateColumns !== null) {
    sql.push('ON DUPLICATE KEY UPDATE', updateColumns.sql);
  }

  return {sql: sql.join(' ') + ';', params: params};
};

module.exports = Upsert;
