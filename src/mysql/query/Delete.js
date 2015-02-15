var _ = require('lodash');
var Filter = require('./Filter');
var OrderBy = require('./OrderBy');
var Limit = require('./Limit');
var escape = require('./escape');

function Delete($query) {
  if (_.isPlainObject($query)) {
    this._orderby = new OrderBy($query.$orderby);
    this._limit = new Limit($query.$limit);
  } else {
    this._orderby = new OrderBy();
    this._limit = new Limit();
  }

  this._filter = new Filter($query);
}

Delete.prototype.toParamSQL = function (table) {
  var filter = this._filter.toParamSQL(table);
  var orderby = this._orderby.toParamSQL(table);
  var limit = this._limit.toParamSQL(table);
  var sql = [];
  var params = [];

  sql.push('DELETE', 'FROM', escape(table.name));

  if (filter) {
    sql.push('WHERE', filter.sql);
    params = params.concat(filter.params);
  }

  if (orderby) {
    sql.push('ORDER BY', orderby.sql);
    params = params.concat(orderby.params);
  }

  if (limit) {
    sql.push('LIMIT', limit.sql);
    params = params.concat(limit.params);
  }

  return {sql: sql.join(' ') + ';', params: params};
};

module.exports = Delete;
