var Values = require('./Values');
var Projection = require('./Projection');
var escape = require('./escape');

function Insert($query) {
  var columns = {};

  $query = $query || {};

  this._ignore = ($query.$ignore === true);
  this._values = new Values($query.$values);

  this._values.getKeys().forEach(function (k) {
    columns[k] = 1;
  });
  this._projection = new Projection(columns);
}

Insert.prototype.toParamSQL = function (table) {
  var projection = this._projection.toParamSQL(table);
  var values = this._values.toParamSQL(table);
  var ignore = this._ignore;

  var sql = [];
  var params = [];

  sql.push('INSERT');

  if (ignore) sql.push('IGNORE');

  sql.push('INTO', escape(table.name), '(' + projection.sql + ')');
  params = params.concat(projection.params);

  sql.push('VALUES', values.sql);
  params = params.concat(values.params);

  return {sql: sql.join(' ') + ';', params: params};
};

module.exports = Insert;
