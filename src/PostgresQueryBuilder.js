var _ = require('lodash'),
  operators = require('./mysql-operators.json');

/**
 * Constructs a new MySQL QueryBuilder for the designated table.
 * @param {string} table the name of the table.
 * @constructor
 */
function QueryBuilder(table) {
  this.table = table;
}

/**
 * Escapes the given string to be use in a SQL query.
 * @param {String} str
 */
QueryBuilder.prototype.escapeSQL = function (str) {
  return '"' + str + '"';
};

/**
 * Compiles and returns a parameterized SQL where clause, based on the given selector input.
 * @param {Array.<object>} selector
 * @returns {object} with two properties: "sql" and "params".
 */
QueryBuilder.prototype.whereClause = function (selector) {
  var sql, params = [];

  sql = 'WHERE ';

  sql += selector.map(function (obj) {
    var keys = Object.keys(obj);

    return keys.map(function (k) {
      var expr = obj[k],
        column, operator, value;

      column = this.escapeSQL(k);

      _.forOwn(expr, function (v, o) {
        operator = operators[o]; // convert to sql equivalent operator
        value = v;

        return false; // exit
      });

      if (value === null && operator === '=') return column + ' IS NULL';
      if (value === null && operator === '!=') return column + ' IS NOT NULL';

      params.push(value);
      return column + ' ' + operator + ' ?';

    }, this).join(' AND ');

  }, this).join(' OR ');

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a SQL order clause, based on the given order input.
 * @param {Array.<object>} order
 * @returns {string}
 */
QueryBuilder.prototype.orderBy = function (order) {
  var sql = 'ORDER BY ';

  sql += order.map(function (obj) {
    var column, type;

    _.forOwn(obj, function (v, k) {
      column = this.escapeSQL(k);
      type =  v.toUpperCase();

      return false; // exit
    }, this);

    return column + ' ' + type;

  }, this).join(', ');

  return sql;
};

/**
 * Compiles and returns a parameterized SELECT statement.
 * @param {object} [props] query properties.
 * @param {(Array.<string>|null)} [props.columns]
 * @param {(Array.<object>|null)} [props.selector]
 * @param {(Array.<object>|null)} [props.order]
 * @param {(number|null)} [props.limit]
 * @param {(number|null)} [props.offset]
 * @return {object} with "sql" and "params" properties.
 *
 * @example output format:
 * {
 *   sql: 'SELECT name FROM table WHERE id = ?;',
 *   params: [1],
 * }
 */
QueryBuilder.prototype.select = function (props) {
  var sql = [], params = [], where;

  // handle optional props param
  if (_.isUndefined(props)) {
    props = {};
  }

  sql.push('SELECT');

  if (props.columns == null) {
    sql.push('*');

  } else {
    sql.push(props.columns.map(function (column) {
      return this.escapeSQL(column);
    }, this).join(', '));
  }

  sql.push('FROM ' + this.escapeSQL(this.table));

  if (props.selector != null) {
    where = this.whereClause(props.selector);

    sql.push(where.sql);
    params.push.apply(params, where.params);
  }

  if (props.order != null) {
    sql.push(this.orderBy(props.order));
  }

  if (props.limit != null) {
    sql.push('LIMIT ' + props.limit);
  }

  if (props.offset != null) {
    sql.push('OFFSET ' + props.offset);
  }

  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a parameterized SELECT COUNT statement.
 * @param {object} [props] query properties.
 * @param {(Array.<object>|null)} [props.selector]
 * @param {(Array.<object>|null)} [props.order]
 * @param {(number|null)} [props.limit]
 * @param {(number|null)} [props.offset]
 * @return {object} with "sql" and "params" properties.
 */
QueryBuilder.prototype.count = function (props) {
  var sql = [], params = [], where;

  // handle optional props param
  if (_.isUndefined(props)) {
    props = {};
  }

  sql.push('SELECT COUNT(*) AS "count"');
  sql.push('FROM ' + this.escapeSQL(this.table));

  if (props.selector != null) {
    where = this.whereClause(props.selector);

    sql.push(where.sql);
    params.push.apply(params, where.params);
  }

  if (props.order != null) {
    sql.push(this.orderBy(props.order));
  }

  if (props.limit != null) {
    sql.push('LIMIT ' + props.limit);
  }

  if (props.offset != null) {
    sql.push('OFFSET ' + props.offset);
  }

  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a parameterized DELETE statement.
 * @param {object} [props] query properties.
 * @param {(Array.<object>|null)} [props.selector]
 * @param {(Array.<object>|null)} [props.order]
 * @param {(number|null)} [props.limit]
 * @return {object} with "sql" and "params" properties.
 */
QueryBuilder.prototype.delete = function (props) {
  var sql = [], params = [], where;

  // handle optional props param
  if (_.isUndefined(props)) {
    props = {};
  }

  sql.push('DELETE');
  sql.push('FROM ' + this.escapeSQL(this.table));

  if (props.selector != null) {
    where = this.whereClause(props.selector);

    sql.push(where.sql);
    params.push.apply(params, where.params);
  }

  if (props.order != null) {
    sql.push(this.orderBy(props.order));
  }

  if (props.limit != null) {
    sql.push('LIMIT ' + props.limit);
  }

  sql = sql.join(' ') + ';';

  return {sql: sql, params: params};
};

/**
 * Compiles and returns a parameterized UPSERT statement.
 * @param {object} props query properties.
 * @param {(Array.<object>)} props.values
 * @return {object} with "sql" and "params" properties.
 */
QueryBuilder.prototype.upsert = function (props) {

  throw new Error('Upsert not yet supported');
  // var sql = [], params = [];

  // sql.push('INSERT INTO ' + this.escapeSQL(this.table));

  // sql.push('(' + props.columns.map(function (column) {
  //   return this.escapeSQL(column);
  // }, this).join(', ') + ')');

  // sql.push('VALUES');

  // sql.push(props.values.map(function(obj) {
  //   return '(' + props.columns.map(function (k) {
  //     params.push(obj[k]);
  //     return '?';
  //   }).join(', ') + ')';
  // }).join(', '));

  // sql.push('ON DUPLICATE KEY UPDATE');

  // sql.push(props.updateColumns.map(function (k) {
  //   k = this.escapeSQL(k);
  //   return k + ' = VALUES(' + k + ')';
  // }, this).join(', '));

  // sql = sql.join(' ') + ';';

  // return {sql: sql, params: params};
};

module.exports = QueryBuilder;
