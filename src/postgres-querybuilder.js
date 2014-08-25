var _ = require('lodash'),
  operators = require('./postgres-operators.json');

module.exports = _.extend(require('./mysql-querybuilder'), {

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
   * @param {Array.<object>} selector
   * @returns {object} with two properties: "sql" and "params".
   * @static
   */
  where: function (selector) {
    var sql = 'WHERE ',
      params = [];

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
   * @param {string} options.table
   * @param {(Array.<object>|null)} [options.selector]
   * @param {(number|null)} [options.limit]
   * @param {(number|null)} [options.offset]
   * @return {object} with "sql" and "params" properties.
   * @throws {Error} If options is invalid or undefined.
   * @static
   */
  count: function (options) {
    var sql = [], params = [], clause;

    // validate "options" param
    if (!_.isPlainObject(options)) {
      throw new Error('Invalid SELECT COUNT query options, expected plain object, received ' + typeof(options));
    }

    // init statement
    sql.push('SELECT COUNT(*) AS "count"');

    // set FROM clause
    sql.push('FROM ' + this.escapeSQL(options.table));

    // set WHERE clause
    if (options.selector) {
      clause = this.where(options.selector);

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
   * @param {string} options.table the table to upsert data.
   * @param {object} options.values values to insert if no record is found.
   * @param {Array.<string>} [options.updateColumns] the record columns to update if record already exists - defaults to all columns.
   * @param {Array.<object>} [options.updateSelector] selector to search if records exists.
   * @return {object} with "sql" and "params" properties.
   * @throws {Error} If options is invalid or undefined.
   * @static
   */
  upsert: function (options) {
    var sql = [], params = [], columns, clause;

    // validate "options" param
    if (!_.isPlainObject(options)) {
      throw new Error('Invalid UPSERT query options, expected plain object, received ' + typeof(options));
    }

    columns = Object.keys(options.values);
    options.updateColumns = options.updateColumns || columns;

    // init statement
    sql.push('WITH upsert AS (UPDATE ' + this.escapeSQL(options.table) + ' SET');

    // set UPDATE columns
    sql.push(
      options.updateColumns.map(function (k) {
        params.push(options.values[k]);
        return this.escapeSQL(k) + ' = ?';
      }, this).join(', ')
    );

    // set UPDATE WHERE clause
    if (options.updateSelector) {
      clause = this.where(options.updateSelector);
      sql.push(clause.sql);
      params.push.apply(params, clause.params);
    }

    // SET RETURNING clause
    sql.push('RETURNING *)');

    // set INSERT statement
    sql.push('INSERT INTO ' + this.escapeSQL(options.table));

    // set INSERT columns
    sql.push(
      '(' + columns.map(function (k) {
        return this.escapeSQL(k);
      }, this).join(', ') + ')'
    );

    // do the trick
    sql.push('SELECT');

    sql.push(
      columns.map(function (k) {
        params.push(options.values[k]);
        return '?';
      }).join(', ')
    );

    sql.push('WHERE NOT EXISTS (SELECT * FROM upsert)');

    // finish it
    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  },

  /**
   * Compiles and returns a BEGIN TRANSACTION statement.
   * @return {string}
   * @static
   */
  beginTransaction: function () {
    return 'BEGIN;';
  },

  /**
   * Compiles and returns a COMMIT TRANSACTION statement.
   * @return {string}
   * @static
   */
  commitTransaction: function () {
    return 'COMMIT;';
  }

});

module.exports = QueryBuilder;
