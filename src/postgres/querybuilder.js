var _ = require('lodash'),
  operators = require('./operators.json'),
  mysql_querybuilder = require('../mysql/querybuilder');

module.exports = _.create(mysql_querybuilder, {

  /**
   * Escapes the given string to use safely in a SQL query.
   * @param {string} str
   * @returns {string}
   * @static
   */
  escapeSQL: function (str) {
    return '"' + str + '"';
  },

  /**
   * Compiles and returns a parameterized SQL where clause, based on the given selector.
   * @param {(object|Array.<object>)} selector
   * @returns {object} with two properties: "sql" and "params".
   * @static
   * @private
   */
  _where: function (selector) {
    var sql = 'WHERE ', params = [];

    if (!_.isArray(selector)) selector = [selector];

    sql += selector.map(function (obj) {

      return Object.keys(obj).map(function (k) {
        var expr = obj[k],
          column = this.escapeSQL(k),
          operator,
          value;

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
  },

  /**
   * Compiles and returns a parameterized SELECT COUNT query.
   * @param {object} options query properties.
   * @param {string} options.table the name of the table to count records from.
   * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
   * @param {number} [options.limit] max number of records to return from table - must be a positive integer, i.e. limit > 0.
   * @param {number} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
   * @return {object} with "sql" and "params" properties.
   * @static
   */
  count: function (options) {
    var sql = [], params = [], clause;

    // init statement
    sql.push('SELECT COUNT(*) AS "count"');

    // set FROM clause
    sql.push('FROM ' + this.escapeSQL(options.table));

    // set WHERE clause
    if (options.selector) {
      clause = this._where(options.selector);

      sql.push(clause.sql);
      params.push.apply(params, clause.params);
    }

    // set LIMIT clause
    if (options.limit) {
      sql.push('LIMIT ' + options.limit);
    }

    // set OFFSET clause
    if (options.offset) {
      sql.push('OFFSET ' + options.offset);
    }

    // finish it
    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  },

  /**
   * Compiles and returns a parameterized UPSERT statement.
   * @param {object} options query properties.
   * @param {string} options.table the table to upsert data into.
   * @param {object} options.values the record values.
   * @param {Array.<string>} options.columns the columns of the record(s) to insert.
   * @param {Array.<string>} options.updateColumns the columns of the record(s) to update.
   * @param {Array.<Array.<string>>} options.updateKeys the columns to check if record(s) already exists in table.
   * @return {object} with "sql" and "params" properties.
   * @static
   */
  upsert: function (options) {
    var sql = [], params = [];

    // init with UPDATE statement
// WITH
//   new_data (id, value) AS (
//     VALUES (1, 2), (3, 4), ...
//   ),
//   updated AS (
//     UPDATE table t set
//       value = t.value + new_data.value
//     FROM new_data
//     WHERE t.id = new_data.id
//     RETURNING t.*
//   ),
//   inserted as (
//   INSERT INTO table (id, value)
//   SELECT id, value
//   FROM new_data
//   WHERE NOT EXISTS (
//     SELECT 1 FROM updated WHERE updated.id = new_data.id
//   )
//   RETURNING id, value)
// SELECT id, value
// FROM inserted
// UNION ALL
// SELECT id, value
// FROM updated

    sql.push('WITH');

    // set UPDATE statement
    sql.push('updated AS (UPDATE ' + this.escapeSQL(options.table) + ' SET');
    sql.push( // key-value pairs
      options.updateColumns.map(function (k) {
        params.push(options.values[k]);
        return this.escapeSQL(k) + ' = ?';
      }, this).join(', ')
    );
    sql.push('WHERE');
    sql.push(
      options.updateKeys.map(function (keys) {
        return keys.map(function (k) {
          params.push(options.values[k]);
          return this.escapeSQL(k) + ' = ?';
        }, this).join(' AND ');
      }, this).join(' OR ')
    );
    sql.push('RETURNING *),');

    // set INSERT statement
    sql.push('inserted AS (INSERT INTO ' + this.escapeSQL(options.table));
    sql.push( // columns
      '(' + options.columns.map(function (k) {
        return this.escapeSQL(k);
      }, this).join(', ') + ')'
    );
    sql.push('SELECT');
    sql.push(
      options.columns.map(function (k) {
        params.push(options.values[k]);
        return '?';
      }).join(', ')
    );
    sql.push('WHERE NOT EXISTS (SELECT * FROM updated)');
    sql.push('RETURNING *)');

    // set final SELECT statement
    sql.push('SELECT * FROM inserted UNION ALL SELECT * FROM updated');

    // finish it
    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  },

  /**
   * Compiles and returns a parameterized INSERT statement.
   * @param {object} options query properties.
   * @param {string} options.table the table name to insert data.
   * @param {(object|Array.<object>)} options.values values to insert if no record is found.
   * @return {object} with "sql" and "params" properties.
   * @static
   */
  insert: function (options) {
    var sql = [], params = [];

    if (!_.isArray(options.values)) options.values = [options.values];

    sql.push('INSERT INTO ' + this.escapeSQL(options.table));

    sql.push(
      '(' + options.columns.map(function (k) {
        return this.escapeSQL(k);
      }, this).join(', ') + ')'
    );

    sql.push('VALUES');
    sql.push(
      options.values.map(function (obj) {
        return '(' + options.columns.map(function (k) {
          params.push(obj[k]);
          return '?';
        }).join(', ') + ')';
      }).join(', ')
    );

    sql.push('RETURNING *');

    // finish it
    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  }

});
