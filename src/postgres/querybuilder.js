var _ = require('lodash'),
  operators = require('./operators.json');

module.exports = _.create(require('../mysql/querybuilder'), {

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
    var sql = 'WHERE ',
      params = [];

    // make sure selector is array
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
    var sql = [],
      params = [],
      clause;

    sql.push('SELECT COUNT(*) AS "count"');
    sql.push('FROM ' + this.escapeSQL(options.table));

    if (options.selector) {
      clause = this._where(options.selector);

      sql.push(clause.sql);
      params.push.apply(params, clause.params);
    }

    if (options.limit) {
      sql.push('LIMIT ' + options.limit);

      if (options.offset) {
        sql.push('OFFSET ' + options.offset);
      }
    }

    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  },

  /**
   * Compiles and returns a parameterized UPSERT statement.
   * @param {object} options query properties.
   * @param {string} options.table the table to upsert data into.
   * @param {object} options.values the record values.
   * @param {Array.<string>} options.columns the columns of the record to insert.
   * @param {Array.<string>} options.updateColumns the columns of the record to update.
   * @param {Array.<Array.<string>>} options.identifier
   * @param {Array.<string>} [options.returnColumns] the columns to return after upsert.
   * @return {object} with "sql" and "params" properties.
   * @static
   */
  upsert: function (options) {
    var sql = '',
      params = [];

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

    sql += 'WITH ';
    sql += 'updated AS (UPDATE ' + this.escapeSQL(options.table) + ' SET ';
    sql += options.updateColumns.map(function (k) {
      params.push(options.values[k]);
      return this.escapeSQL(k) + ' = ?';
    }, this).join(', ');
    sql += ' WHERE ';
    sql += options.identifier.map(function (keys) {
      return keys.map(function (k) {
        params.push(options.values[k]);
        return this.escapeSQL(k) + ' = ?';
      }, this).join(' AND ');
    }, this).join(' OR ');
    sql += ' RETURNING ';

    if (options.returnColumns) {
      sql += options.returnColumns.map(function (k) {
        return this.escapeSQL(k);
      }, this).join(', ');
    } else {
      sql += '*';
    }

    sql += '), ';

    sql += 'inserted AS (INSERT INTO ' + this.escapeSQL(options.table) + ' (';
    sql += options.columns.map(function (k) {
      return this.escapeSQL(k);
    }, this).join(', ');
    sql += ') SELECT ';
    sql += options.columns.map(function (k) {
      params.push(options.values[k]);
      return '?';
    }).join(', ');
    sql += ' WHERE NOT EXISTS (SELECT * FROM updated) RETURNING ';

    if (options.returnColumns) {
      sql += options.returnColumns.map(function (k) {
        return this.escapeSQL(k);
      }, this).join(', ');
    } else {
      sql += '*';
    }

    sql += ') ';

    sql += 'SELECT * FROM inserted UNION ALL SELECT * FROM updated;';

    return {sql: sql, params: params};
  },

  /**
   * Compiles and returns a parameterized INSERT statement.
   * @param {object} options query properties.
   * @param {string} options.table the table name to insert data.
   * @param {Array.<string>} options.columns the columns of the record to insert.
   * @param {(object|Array.<object>)} options.values values to insert if no record is found.
   * @param {Array.<string>} [options.returnColumns] the columns to return after upsert.
   * @return {object} with "sql" and "params" properties.
   * @static
   */
  insert: function (options) {
    var sql = [],
      params = [];

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

    sql.push('RETURNING');

    if (options.returnColumns) {
      sql.push(
        options.returnColumns.map(function (k) {
          return this.escapeSQL(k);
        }, this).join(', ')
      );
    } else {
      sql.push('*');
    }

    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  }

});
