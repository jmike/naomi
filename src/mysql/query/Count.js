var _ = require('lodash');
var Filter = require('./Filter');
var OrderBy = require('./OrderBy');
var Offset = require('./Offset');
var Limit = require('./Limit');
var escape = require('./escape');

function Count($query) {
  if (_.isPlainObject($query)) {
    this._orderby = new OrderBy($query.$orderby);
    this._limit = new Limit($query.$limit);
    this._offset = new Offset($query.$offset);
  } else {
    this._orderby = new OrderBy();
    this._limit = new Limit();
    this._offset = new Offset();
  }

  this._filter = new Filter($query);
}

Count.prototype.toParamSQL = function (table) {
  var filter = this._filter.toParamSQL(table);
  var orderby = this._orderby.toParamSQL(table);
  var limit = this._limit.toParamSQL(table);
  var offset = this._offset.toParamSQL(table);
  var sql = [];
  var params = [];

  sql.push('SELECT', 'COUNT(*) AS `count`');

  sql.push('FROM', escape(table.name));

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

    if (offset) {
      sql.push('OFFSET', offset.sql);
      params = params.concat(offset.params);
    }
  }

  return {sql: sql.join(' ') + ';', params: params};
};

module.exports = Count;
