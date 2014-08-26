var mysql = require('mysql'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  Transaction = require('./MySQLTransaction');

/**
 * Constructs a new MySQL database Engine.
 * @param {object} options connection options.
 * @param {string} options.host the hostname of the database.
 * @param {(string|number)} options.port the port number of the database.
 * @param {string} options.user the user to authenticate to the database.
 * @param {string} options.password the password of the user.
 * @param {string} options.database the name of the database, a.k.a. the schema.
 * @see {@link https://github.com/felixge/node-mysql#connection-options} for a list of connection options to use.
 * @constructor
 */
function Engine(options) {
  this._options = options;
  this._pool = null;
}

/**
 * Connects to database using the connection options given at construction time.
 * @returns {Promise}
 */
Engine.prototype.connect = function () {
  var self = this;

  return Promise.try(function () {
    self._pool = mysql.createPool(self._options);
    return;
  });
};

/**
 * Disconnects from database.
 * @returns {Promise}
 */
Engine.prototype.disconnect = function () {
  var self = this, resolver;

  resolver = function (resolve, reject) {
    self._pool.end(function (err) {
      if (err) return reject(err);
      resolve();
    });
  };

  return new Promise(resolver);
};

/**
 * Acquires the first available client from pool.
 * @param {function} [callback] an optional callback function.
 * @return {Promise} resolving to client.
 * @private
 */
Engine.prototype._acquireClient = function (callback) {
  var self = this, resolver;

  resolver = function (resolve, reject) {
    self._pool.getConnection(function (err, client) {
      if (err) return reject(err);
      resolve(client);
    });
  };

  return new Promise(resolver).nodeify(callback);
};

/**
 * Releases the designated client to pool.
 * @private
 */
Engine.prototype._releaseClient = function (client) {
  client.release();
};

/**
 * Runs the given SQL statement.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} [options] optional query options.
 * @param {boolean} [options.nestTables] set to true to handle overlapping column names.
 * @returns {Promise}
 */
Engine.prototype.query = function (sql, params, options) {
  var self = this, resolver;

  options = options || {};

  resolver = function (resolve, reject) {
    self._acquireClient(function (err, client) {
      if (err) return reject(err);

      if (options.nestTables) {
        sql = {
          sql: sql,
          nestTables: options.nestTables
        };
      }

      client.query(sql, params, function(err, records) {
        var data;

        self._releaseClient(client);

        if (err) return reject(err);

        if (_.isArray(records)) { // SELECT statement
          resolve(records);

        } else { // DML statement
          data = {
            insertId: records.insertId,
            affectedRows: records.affectedRows
          };

          resolve(data);
        }
      });
    });
  };

  return new Promise(resolver);
};

/**
 * Escapes the given string to use safely in a SQL query.
 * @param {string} str
 * @returns {string}
 */
Engine.prototype.escapeSQL = function (str) {
  return '`' + str + '`';
};

/**
 * Compiles and returns a parameterized SQL where clause, based on the given selector.
 * @param {Array.<object>} selector
 * @returns {object} with two properties: "sql" and "params".
 * @private
 */
Engine.prototype._compileWhere = function (selector) {
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
};

/**
 * Compiles and returns a SQL order clause, based on the given order.
 * @param {Array.<object>} order
 * @returns {string}
 * @private
 */
Engine.prototype._compileOrderBy = function (order) {
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
Engine.prototype.select = function (options) {
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
    clause = this.where(options.selector);

    sql.push(clause.sql);
    params.push.apply(params, clause.params);
  }

  // set ORDER BY clause
  if (options.order) {
    clause = this.orderBy(options.order);
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
};

/**
 * Initiates a new transaction.
 * @returns {Promise} resolving to a new Transaction.
 */
Engine.prototype.beginTransaction = function () {
  return new Transaction(this).begin();
};

/**
 * Retrieves meta-data from database.
 * @returns {Promise} resolving to a meta-data object.
 *
 * @example meta-data object
 * {
 *   table1: {
 *     columns: {
 *       column1: {
 *         type: "",
 *         position: 1,
 *         isNullable: true
 *       },
 *       column2: {..},
 *       column3: {..}
 *     },
 *     primaryKey: ["column1", "column2"],
 *     uniqueKeys: {
 *       uniqueKey1: ["column2", "column3"]
 *     },
 *     indexKeys: {
 *       indexKey1: ["column2", "column3"]
 *     },
 *     refTables: {
 *       table2: [
 *         {
 *           column: "column1",
 *           refColumn: "table2Column1"
 *         },
 *         {
 *           column: "column2",
 *           refColumn: "table2Column2"
 *         }
 *       ]
 *     }
 *   }
 * }
 */
Engine.prototype.getMeta = function () {
  return Promise.props({
    tables: this._getTables(),
    columns: this._getColumns(),
    indices: this._getIndices(),
    foreignKeys: this._getForeignKeys()
  }).then(function(result) {
    var meta = {};

    // add tables + empty properties
    result.tables.forEach(function (table) {
      meta[table] = {
        columns: {},
        primaryKey: [],
        uniqueKeys: {},
        indexKeys: {},
        refTables: {}
      };
    });

    // set columns in table(s)
    result.columns.forEach(function (column) {
      var table = meta[column.table];

      table.columns[column.name] = {
        type: column.type,
        position: column.position,
        isNullable: column.isNullable
      };
    });

    // set indices in table(s)
    result.indices.forEach(function (index) {
      var table = meta[index.table];

      if (index.key === 'PRIMARY') {
        table.primaryKey.push(index.column);

      } else if (index.isUnique) {
        table.uniqueKeys[index.key] = table.uniqueKeys[index.key] || [];
        table.uniqueKeys[index.key].push(index.column);

      } else {
        table.indexKeys[index.key] = table.indexKeys[index.key] || [];
        table.indexKeys[index.key].push(index.column);
      }
    });

    // set foreign keys in table(s)
    result.foreignKeys.forEach(function (foreignKey) {
      var table = meta[foreignKey.table];

      table.refTables[foreignKey.refTable] = table.refTables[foreignKey.refTable] || [];
      table.refTables[foreignKey.refTable].push({
        column: foreignKey.column,
        refColumn: foreignKey.refColumn
      });

      // do the other side of the relation
      table = meta[foreignKey.refTable];

      table.refTables[foreignKey.table] = table.refTables[foreignKey.table] || [];
      table.refTables[foreignKey.table].push({
        column: foreignKey.refColumn,
        refColumn: foreignKey.column
      });
    });

    return meta;
  });
};

/**
 * Retrieves table names from database.
 * @returns {Promise}
 * @private
 */
Engine.prototype._getTables = function () {
  var schema = this._options.database,
    sql, params;

  sql = 'SHOW FULL TABLES FROM ??;';
  params = [schema];

  return this.query(sql, params, {}).then(function (records) {
    return records.filter(function (record) {
      return record.Table_type === 'BASE TABLE';
    }).map(function (record) {
      return record['Tables_in_' + schema];
    });
  });
};

/**
 * Retrieves column properties from database.
 * @returns {Promise}
 * @private
 */
Engine.prototype._getColumns = function () {
  var sql, params;

  sql = 'SELECT * FROM information_schema.COLUMNS WHERE table_schema = ?;';
  params = [this._options.database];

  return this.query(sql, params).then(function (records) {
    return records.map(function (record) {
      return {
        name: record.COLUMN_NAME,
        table: record.TABLE_NAME,
        type: record.DATA_TYPE,
        isNullable: record.IS_NULLABLE === 'YES',
        default: record.COLUMN_DEFAULT,
        collation: record.COLLATION_NAME,
        comment: record.COLUMN_COMMENT === '' ? null : record.COLUMN_COMMENT,
        position: record.ORDINAL_POSITION - 1 // zero-indexed
      };
    });
  });
};

/**
 * Retrieves index properties from database.
 * @returns {Promise}
 * @private
 */
Engine.prototype._getIndices = function () {
  var sql, params;

  sql = 'SELECT * FROM information_schema.STATISTICS WHERE table_schema = ?;';
  params = [this._options.database];

  return this.query(sql, params, {}).then(function (records) {
    return records.map(function (record) {
      return {
        key: record.INDEX_NAME,
        table: record.TABLE_NAME,
        column: record.COLUMN_NAME,
        isUnique: record.NON_UNIQUE === 0
      };
    });
  });
};

/**
 * Retrieves foreign key properties from database.
 * @returns {Promise}
 * @private
 */
Engine.prototype._getForeignKeys = function () {
  var schema = this._options.database,
    sql, params;

  sql = 'SELECT * FROM information_schema.KEY_COLUMN_USAGE ' +
    'WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_SCHEMA = ?;';
  params = [schema, schema];

  return this.query(sql, params, {}).then(function (records) {
    return records.map(function (record) {
      return {
        key: record.CONSTRAINT_NAME,
        table: record.TABLE_NAME,
        column: record.COLUMN_NAME,
        refTable: record.REFERENCED_TABLE_NAME,
        refColumn: record.REFERENCED_COLUMN_NAME
      };
    });
  });
};

module.exports = Engine;
