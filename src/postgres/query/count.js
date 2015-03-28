var _ = require('lodash');
var filter = require('./filter');
var orderby = require('./orderby');
var offset = require('./offset');
var limit = require('./limit');
var escape = require('./escape');

module.exports = function ($query, table) {
  var sql = [];
  var params = [];
  var _orderby = orderby(_.isPlainObject($query) ? $query.$orderby : undefined, table);
  var _limit = limit(_.isPlainObject($query) ? $query.$limit : undefined, table);
  var _offset = offset(_.isPlainObject($query) ? $query.$offset : undefined, table);
  var _filter = new filter($query, table);

  sql.push('SELECT', 'COUNT(*) AS "count"');

  sql.push('FROM', escape(table.name));

  if (_filter.sql !== '') {
    sql.push('WHERE', _filter.sql);
    params = params.concat(_filter.params);
  }

  if (_orderby.sql !== '') {
    sql.push('ORDER BY', _orderby.sql);
    params = params.concat(_orderby.params);
  }

  if (_limit.sql !== '') {
    sql.push('LIMIT', _limit.sql);
    params = params.concat(_limit.params);

    if (_offset.sql !== '') {
      sql.push('OFFSET', _offset.sql);
      params = params.concat(_offset.params);
    }
  }

  return {sql: sql.join(' ') + ';', params: params};
};
