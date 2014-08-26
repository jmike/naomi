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
   * @param {Array.<object>} selector
   * @returns {object} with two properties: "sql" and "params".
   * @static
   * @private
   */
  _where: function (selector) {
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
   * Compiles and returns a SQL order clause, based on the given order.
   * @param {Array.<object>} order
   * @returns {string}
   * @static
   */
  _orderBy: function (order) {
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
  },

  /**
   * Compiles and returns a parameterized SELECT query.
   * @param {object} options query properties.
   * @param {string} options.table
   * @param {(Array.<string>|null)} [options.columns]
   * @param {(Array.<object>|null)} [options.selector]
   * @param {(Array.<object>|null)} [options.order]
   * @param {(number|null)} [options.limit]
   * @param {(number|null)} [options.offset]
   * @returns {object} with "sql" and "params" properties.
   * @throws {Error} If options is invalid or undefined.
   * @static
   *
   * @example output format:
   * {
   *   sql: 'SELECT name FROM table WHERE id = ?;',
   *   params: [1],
   * }
   */
  select: function (options) {
    var sql = [], params = [], clause;

    // validate "options" param
    if (!_.isPlainObject(options)) {
      throw new Error('Invalid SELECT query options, expected plain object, received ' + typeof(options));
    }

    // init statement
    sql.push('SELECT');

    // set columns
    if (options.columns) {
      clause = options.columns.map(function (column) {
        return this.escapeSQL(column);
      }, this).join(', ');
      sql.push(clause);

    } else {
      sql.push('*');
    }

    // set FROM clause
    sql.push('FROM ' + this.escapeSQL(options.table));

    // set WHERE clause
    if (options.selector) {
      clause = this._where(options.selector);

      sql.push(clause.sql);
      params.push.apply(params, clause.params);
    }

    // set ORDER BY clause
    if (options.order) {
      clause = this._orderBy(options.order);
      sql.push(clause);
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
    sql.push('SELECT COUNT(*) AS `count`');

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
   * Compiles and returns a parameterized DELETE statement.
   * @param {object} options query properties.
   * @param {string} options.table
   * @param {(Array.<object>|null)} [options.selector]
   * @param {(Array.<object>|null)} [options.order]
   * @param {(number|null)} [options.limit]
   * @return {object} with "sql" and "params" properties.
   * @throws {Error} If options is invalid or undefined.
   * @static
   */
  delete: function (options) {
    var sql = [], params = [], clause;

    // validate "options" param
    if (!_.isPlainObject(options)) {
      throw new Error('Invalid DELETE query options, expected plain object, received ' + typeof(options));
    }

    // init DELETE statement
    sql.push('DELETE');

    // set FROM clause
    sql.push('FROM ' + this.escapeSQL(options.table));

    // set WHERE clause
    if (options.selector) {
      clause = this._where(options.selector);

      sql.push(clause.sql);
      params.push.apply(params, clause.params);
    }

    // set ORDER BY clause
    if (options.order) {
      clause = this._orderBy(options.order);
      sql.push(clause);
    }

    // set LIMIT clause
    if (options.limit) {
      sql.push('LIMIT ' + options.limit);
    }

    // finish it
    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  },

  /**
   * Compiles and returns a parameterized UPSERT statement.
   * @param {object} options query properties.
   * @param {string} options.table
   * @param {object} options.values values to upsert.
   * @param {Array.<string>} [options.updateColumns] columns to update if record already exists - defaults to all columns.
   * @param {Array.<object>} [options.updateSelector] selector to search if records exists.
   * @return {object} with "sql" and "params" properties.
   * @throws {Error} If options is invalid or undefined.
   * @static
   */
  upsert: function (options) {
    var sql = [], params = [], columns;

    // validate "options" param
    if (!_.isPlainObject(options)) {
      throw new Error('Invalid UPSERT query options, expected plain object, received ' + typeof(options));
    }

    columns = Object.keys(options.values);
    options.updateColumns = options.updateColumns || columns;

    // init statement
    sql.push('INSERT INTO ' + this.escapeSQL(options.table));

    // set INSERT columns
    sql.push('(' + columns.map(function (column) {
      return this.escapeSQL(column);
    },this).join(', ') + ')');

    // set VALUES
    sql.push('VALUES');

    sql.push('(' + columns.map(function (k) {
      params.push(options.values[k]);
      return '?';
    }).join(', ') + ')');

    // set UPDATE columns
    sql.push('ON DUPLICATE KEY UPDATE');

    sql.push(options.updateColumns.map(function (column) {
      column = this.escapeSQL(column);
      return column + ' = VALUES(' + column + ')';
    }, this).join(', '));

    // finish it
    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  },

  /**
   * Compiles and returns a parameterized INSERT statement.
   * @param {object} options query properties.
   * @param {string} options.table the table to upsert data.
   * @param {object} options.values values to insert if no record is found.
   * @return {object} with "sql" and "params" properties.
   * @throws {Error} If options is invalid or undefined.
   * @static
   */
  insert: function (options) {
    var sql = [], params = [], columns;

    // validate "options" param
    if (!_.isPlainObject(options)) {
      throw new Error('Invalid INSERT query options, expected plain object, received ' + typeof(options));
    }

    columns = Object.keys(options.values);

    // init statement
    sql.push('INSERT INTO ' + this.escapeSQL(options.table));

    // set VALUES
    sql.push('SET');

    sql.push(
      columns.map(function (k) {
        params.push(options.values[k]);
        return this.escapeSQL(k) + ' = ?';
      }, this).join(', ')
    );

    // finish it
    sql = sql.join(' ') + ';';

    return {sql: sql, params: params};
  }

};
