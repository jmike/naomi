var _ = require('lodash');
var type = require('type-of');

function QueryBuilder(table) {
  this.table = table;
}

QueryBuilder.prototype.escape = function (identifier) {
  return '`' + identifier + '`';
};

QueryBuilder.prototype.$projection = function ($projection) {
  var _this = this;
  var $include = $projection.$include;
  var $exclude = $projection.$exclude;
  var columns = this.table.columns.map(function (e) {
    return e.name;
  });

  // check if $include is not empty
  if (!_.isEmpty($include)) {
    return $include
      .map(function (e) {
        if (_this.table.hasColumn(e)) return _this.escape(e);
        throw new Error('Unknown column "' + e + '"; not found in table "' + _this.table.name + '"');
      })
      .join(', ');
  }

  // check if $exclude is not empty
  if (!_.isEmpty($exclude)) {
    return _.chain($exclude)
      .xor(columns)
      .map(function (e) {
        if (_this.table.hasColumn(e)) return _this.escape(e);
        throw new Error('Unknown column "' + e + '"; not found in table "' + _this.table.name + '"');
      })
      .join(', ')
      .value();
  }

  // both $include and $exclude are empty
  return columns
    .map(function (e) {
      return _this.escape(e);
    })
    .join(', ');
};

QueryBuilder.prototype.$orderby = function ($orderby) {
  var _this = this;

  if (_.isEmpty($orderby)) return null;

  return $orderby
    .map(function (e) {
      var k = Object.keys(e)[0];
      var v = e[k];

      if (!_this.table.hasColumn(k)) {
        throw new Error('Unknown column "' + k + '"; not found in table "' + _this.table.name + '"');
      }
      return _this.escape(k) + ' ' + (v === 1 ? 'ASC' : 'DESC');
    })
    .join(', ');
};

QueryBuilder.prototype.$and = function ($and) {
  var _this = this;
  var sql = [];
  var params = [];

  if (!_.isArray($and)) {
    throw new Error('Invalid value for $and expression; expected array, received ' + type($and));
  }

  if (_.isEmpty($and)) return null;

  $and.forEach(function (e, i) {
    var query = _this.$expression(e);
    if (i !== 0) sql.push('AND');
    sql.push(query.sql);
    params = params.concat(query.params);
  });

  return {sql: '(' + sql.join(' ') + ')', params: params};
};

QueryBuilder.prototype.$or = function ($or) {
  var _this = this;
  var sql = [];
  var params = [];

  if (!_.isArray($or)) {
    throw new Error('Invalid value for $or expression; expected array, received ' + type($or));
  }

  if (_.isEmpty($or)) return null;

  $or.forEach(function (e, i) {
    var query = _this.$expression(e);
    if (i !== 0) sql.push('OR');
    sql.push(query.sql);
    params = params.concat(query.params);
  });

  return {sql: '(' + sql.join(' ') + ')', params: params};
};

QueryBuilder.prototype.$eq = function ($eq) {
  var sql = [];
  var params = [];

  if (_.isNull($eq)) {
    sql.push('IS NULL');
  } else if (_.isNumber($eq) || _.isString($eq) || _.isBoolean($eq) || _.isDate($eq) || Buffer.isBuffer($eq)) {
    sql.push('=', '?');
    params.push($eq);
  } else {
    throw new Error(
      'Invalid value for $eq expression; ' +
      'expected number|string|boolean|date|buffer|null, received ' + type($eq)
    );
  }

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$ne = function ($ne) {
  var sql = [];
  var params = [];

  if (_.isNull($ne)) {
    sql.push('IS NOT NULL');
  } else if (_.isNumber($ne) || _.isString($ne) || _.isBoolean($ne) || _.isDate($ne) || Buffer.isBuffer($ne)) {
    sql.push('!=', '?');
    params.push($ne);
  } else {
    throw new Error(
      'Invalid value for $ne expression; ' +
      'expected number|string|boolean|date|buffer|null, received ' + type($ne)
    );
  }

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$gt = function ($gt) {
  var sql = [];
  var params = [];

  if (_.isNumber($gt) || _.isString($gt) || _.isBoolean($gt) || _.isDate($gt) || Buffer.isBuffer($gt)) {
    sql.push('>', '?');
    params.push($gt);
  } else {
    throw new Error(
      'Invalid value for $gt expression; ' +
      'expected number|string|boolean|date|buffer, received ' + type($gt)
    );
  }

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$gte = function ($gte) {
  var sql = [];
  var params = [];

  if (_.isNumber($gte) || _.isString($gte) || _.isBoolean($gte) || _.isDate($gte) || Buffer.isBuffer($gte)) {
    sql.push('>=', '?');
    params.push($gte);
  } else {
    throw new Error(
      'Invalid value for $gte expression; ' +
      'expected number|string|boolean|date|buffer, received ' + type($gte)
    );
  }

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$lt = function ($lt) {
  var sql = [];
  var params = [];

  if (_.isNumber($lt) || _.isString($lt) || _.isBoolean($lt) || _.isDate($lt) || Buffer.isBuffer($lt)) {
    sql.push('<', '?');
    params.push($lt);
  } else {
    throw new Error(
      'Invalid value for $lt expression; ' +
      'expected number|string|boolean|date|buffer, received ' + type($lt)
    );
  }

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$lte = function ($lte) {
  var sql = [];
  var params = [];

  if (_.isNumber($lte) || _.isString($lte) || _.isBoolean($lte) || _.isDate($lte) || Buffer.isBuffer($lte)) {
    sql.push('<=', '?');
    params.push($lte);
  } else {
    throw new Error(
      'Invalid value for $lte expression; ' +
      'expected number|string|boolean|date|buffer, received ' + type($lte)
    );
  }

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$in = function ($in) {
  var sql = [];
  var params = [];
  var values;

  if (!_.isArray($in)) {
    throw new Error('Invalid value for $in expression; expected array, received ' + type($in));
  }

  if (_.isEmpty($in))  {
    throw new Error('Invalid value for $in expression; array cannot be empty');
  }

  sql.push('IN');

  values = $in
    .map(function (e) {
      params.push(e);
      return '?';
    })
    .join(', ');

  sql.push('(' + values + ')');

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$nin = function ($nin) {
  var sql = [];
  var params = [];
  var values;

  if (!_.isArray($nin)) {
    throw new Error('Invalid value for $nin expression; expected array, received ' + type($nin));
  }

  if (_.isEmpty($nin))  {
    throw new Error('Invalid value for $nin expression; array cannot be empty');
  }

  sql.push('NOT IN');

  values = $nin
    .map(function (e) {
      params.push(e);
      return '?';
    })
    .join(', ');

  sql.push('(' + values + ')');

  return {sql: sql.join(' '), params: params};
};

QueryBuilder.prototype.$like = function ($like) {
  var sql = [];
  var params = [];

  if (_.isString($like)) {
    sql.push('LIKE', '?');
    params.push($like);
  } else {
    throw new Error(
      'Invalid value for $like expression; ' +
      'expected string, received ' + type($like)
    );
  }

  return {sql: sql.join(' '), params: params};
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
