var _ = require('lodash'),
  operators = require('./operators.json');

module.exports = {

  /**
   * Escapes the given string to use safely in a SQL query.
   * @param {string} str
   * @returns {string}
   * @static
   */
  escapeSQL: function (str) {
    return '`' + str + '`';
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
   * Compiles and returns a SQL order clause, based on the given order.
   * @param {(object|Array.<object>)} order
   * @returns {string}
   * @static
   * @private
   */
  _orderBy: function(order) {
    var sql = 'ORDER BY ';

    if (!_.isArray(order)) order = [order];

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
  },

  /**
   * Compiles and returns a parameterized SELECT query.
   * @param {object} options query options.
   * @param {string} options.table the name of the table to select records from.
   * @param {Array.<string>} [options.columns] the name of the columns to select.
   * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
   * @param {(object|Array.<object>)} [options.order] an order expression to sort records.
   * @param {number} [options.limit] max number of records to return from table - must be a positive integer, i.e. limit > 0.
   * @param {number} [options.offset] number of records to skip from table - must be a non-negative integer, i.e. offset >= 0.
   * @returns {object} with "sql" and "params" properties.
   * @static
   *
   * @example output format:
   * {
   *   sql: 'SELECT name FROM table WHERE id = ?;',
   *   params: [1],
   * }
   */
  select: function (options) {
    var sql = [],
      params = [],
      clause;

    sql.push('SELECT');

    if (options.columns) {
      sql.push(options.columns.map(function (column) {
        return this.escapeSQL(column);
      }, this).join(', '));

    } else {
      sql.push('*');
    }

    sql.push('FROM ' + this.escapeSQL(options.table));

    if (options.selector) {
      clause = this._where(options.selector);

      sql.push(clause.sql);
      params.push.apply(params, clause.params);
    }

    if (options.order) {
      sql.push(this._orderBy(options.order));
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

    sql.push('SELECT COUNT(*) AS `count`');
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
   * Compiles and returns a parameterized DELETE statement.
   * @param {object} options query properties.
   * @param {string} options.table the name of the table to delete records from.
   * @param {(object|Array.<object>)} [options.selector] a selector to match record(s) in table.
   * @param {(object|Array.<object>)} [options.order] an order expression to sort records.
   * @param {number} [options.limit] max number of records to delete from database - must be a positive integer, i.e. limit > 0.
   * @return {object} with "sql" and "params" properties.
   * @static
   */
  del: function (options) {
    var sql = [],
      params = [],
      clause;

    sql.push('DELETE');

    sql.push('FROM ' + this.escapeSQL(options.table));

    if (options.selector) {
      clause = this._where(options.selector);

      sql.push(clause.sql);
      params.push.apply(params, clause.params);
    }

    if (options.order) {
      sql.push(this._orderBy(options.order));
    }

    if (options.limit) {
      sql.push('LIMIT ' + options.limit);
    }

    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  },

  /**
   * Compiles and returns a parameterized UPSERT statement.
   * @param {object} options query properties.
   * @param {string} options.table
   * @param {Array.<string>} options.columns column names to insert.
   * @param {object} options.values values to upsert.
   * @param {Array.<string>} [options.updateColumns] columns to update if record already exists - defaults to all columns.
   * @return {object} with "sql" and "params" properties.
   * @static
   */
  upsert: function (options) {
    var sql = [],
      params = [];

    // handle option updateColumns param
    options.updateColumns = options.updateColumns || options.columns;

    sql.push('INSERT INTO ' + this.escapeSQL(options.table));

    sql.push('(' + options.columns.map(function (column) {
      return this.escapeSQL(column);
    }, this).join(', ') + ')');

    sql.push('VALUES');

    sql.push('(' + options.columns.map(function (k) {
      params.push(options.values[k]);
      return '?';
    }).join(', ') + ')');

    sql.push('ON DUPLICATE KEY UPDATE');

    sql.push(options.updateColumns.map(function (column) {
      column = this.escapeSQL(column);
      return column + ' = VALUES(' + column + ')';
    }, this).join(', '));

    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  },

  /**
   * Compiles and returns a parameterized INSERT statement.
   * @param {object} options query properties.
   * @param {string} options.table the table name to insert data.
   * @param {Array.<string>} options.columns column names to insert.
   * @param {(object|Array.<object>)} options.values values to insert.
   * @return {object} with "sql" and "params" properties.
   * @static
   */
  insert: function (options) {
    var sql = [], params = [];

    sql.push('INSERT INTO ' + this.escapeSQL(options.table));
    sql.push('SET');

    sql.push(options.columns.map(function (k) {
      params.push(options.values[k]);
      return this.escapeSQL(k) + ' = ?';
    }, this).join(', '));

    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  }

};
