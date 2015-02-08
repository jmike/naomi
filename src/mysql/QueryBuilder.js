var _ = require('lodash');
var type = require('type-of');

function QueryBuilder(table) {
  this.table = table;
}

QueryBuilder.prototype.escape = function (identifier) {
  return '`' + identifier + '`';
};

QueryBuilder.prototype.$primarykey = function ($primarykey) {
  var sql = [];
  var params = [];
  var query;

  if (this.table.primaryKey.length !== 1) {
    throw new Error(
      'Invalid $query expression; ' +
      'primary key is compound or non existent'
    );
  }

  sql.push(this.escape(this.table.primaryKey[0]));

  if (_.isPlainObject($primarykey)) {
    query = this.$expression($primarykey);
    sql.push(query.sql);
    params = params.concat(query.params);
  } else {
    query = this.$eq($primarykey);
    sql.push(query.sql);
    params = params.concat(query.params);
  }

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$expression = function ($expression) {
  var sql = [];
  var params = [];

  var key;
  var value;
  var query;

  if (_.isEmpty($expression)) return null;

  key = Object.keys($expression)[0];
  value = $expression[key];

  if (key[0] === '$' && key !== '$projection' && key !== '$orderby' && key !== '$limit' && key !== '$offset') {
    query = this[key](value);
    sql.push(query.sql);
    params = params.concat(query.params);
  } else {
      if (!this.table.hasColumn(key)) {
        throw new Error('Unknown column "' + key + '"; not found in table "' + this.table.name + '"');
      }

      sql.push(this.escape(key));

      if (_.isPlainObject(value)) {
        query = this.$expression(value);
        sql.push(query.sql);
        params = params.concat(query.params);
      } else {
        query = this.$eq(value);
        sql.push(query.sql);
        params = params.concat(query.params);
      }
  }

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$updateColumns = function ($updateColumns) {
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

QueryBuilder.prototype.$values = function ($values) {
  var sql = [];
  var params = [];

  var keys = Object.keys($values[0]);

  sql = $values
    .map(function (e) {
      var group = keys
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

QueryBuilder.prototype.select = function ($query) {
  var sql = [];
  var params = [];

  var projection = this.$projection($query.$projection);
  var table = this.escape(this.table.name);
  var filter = this.$expression($query.$filter);
  var orderby = this.$orderby($query.$orderby);

  sql.push('SELECT', projection, 'FROM', table);

  if (filter) {
    sql.push('WHERE', filter.sql);
    params = params.concat(filter.params);
  }

  if (orderby) {
    sql.push('ORDER BY', orderby);
  }

  if ($query.$limit) {
    sql.push('LIMIT', $query.$limit);
    if ($query.$offset) {
      sql.push('OFFSET', $query.$offset);
    }
  }

  return {sql: sql.join(' ') + ';', params: params};
};

QueryBuilder.prototype.count = function ($query) {
  var sql = [];
  var params = [];

  var table = this.escape(this.table.name);
  var filter = this.$expression($query.$filter);
  var orderby = this.$orderby($query.$orderby);

  sql.push('SELECT', 'COUNT(*) AS `count`', 'FROM', table);

  if (filter) {
    sql.push('WHERE', filter.sql);
    params = params.concat(filter.params);
  }

  if (orderby) {
    sql.push('ORDER BY', orderby);
  }

  if ($query.$limit) {
    sql.push('LIMIT', $query.$limit);
    if ($query.$offset) {
      sql.push('OFFSET', $query.$offset);
    }
  }

  return {sql: sql.join(' ') + ';', params: params};
};

QueryBuilder.prototype.delete = function ($query) {
  var sql = [];
  var params = [];

  var table = this.escape(this.table.name);
  var filter = this.$expression($query.$filter);
  var orderby = this.$orderby($query.$orderby);

  sql.push('DELETE', 'FROM', table);

  if (filter) {
    sql.push('WHERE', filter.sql);
    params = params.concat(filter.params);
  }

  if (orderby) {
    sql.push('ORDER BY', orderby);
  }

  if ($query.$limit) {
    sql.push('LIMIT', $query.$limit);
  }

  return {sql: sql.join(' ') + ';', params: params};
};

QueryBuilder.prototype.upsert = function ($query) {
  var sql = [];
  var params = [];

  var table = this.escape(this.table.name);
  var columns = Object.keys($query.$values[0]);
  var updateColumns = this.$updateColumns(_.difference(columns, this.primaryKey));
  var projection = this.$projection({$include: columns});
  var values = this.$values($query.$values);

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

QueryBuilder.prototype.insert = function ($query) {
  var sql = [];
  var params = [];

  var table = this.escape(this.table.name);
  var columns = Object.keys($query.$values[0]);
  var projection = this.$projection({$include: columns});
  var values = this.$values($query.$values);

  sql.push('INSERT');

  if ($query.$ignore === true) sql.push('IGNORE');

  sql.push('INTO', table, '(' + projection + ')');

  sql.push('VALUES', values.sql);
  params = params.concat(values.params);

  return {sql: sql.join(' ') + ';', params: params};
};

module.exports = QueryBuilder;
