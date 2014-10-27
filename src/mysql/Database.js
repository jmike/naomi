var  mysql = require('mysql'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  GenericDatabase = require('../Database'),
  Table = require('./Table'),
  Transaction = require('./Transaction');

/**
 * Constructs a new MySQL Database.
 * @extends {GenericDatabase}
 * @constructor
 */
function Database() {
  GenericDatabase.apply(this, arguments);
  this._pool = null;
}

// MySQL Database extends GenericDatabase
Database.prototype = Object.create(GenericDatabase.prototype);

// associate with MySQL Table class
Database.prototype.Table = Table;

// associate with MySQL Transaction class
Database.prototype.Transaction = Transaction;

/**
 * Attempts to connect to database server using the connection properties supplied at construction time.
 * @returns {Promise}
 * @private
 */
Database.prototype._connect = function () {
  var self = this;

  return Promise.try(function () {
    self._pool = mysql.createPool(self.connectionProperties);
    return;
  });
};

/**
 * Gracefully closes any open connection to the database server.
 * @returns {Promise}
 * @private
 */
Database.prototype._disconnect = function () {
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
 */
Database.prototype.acquireClient = function (callback) {
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
 */
Database.prototype.releaseClient = function (client) {
  client.release();
};

/**
 * Runs the given SQL statement to the database server.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} options query options.
 * @param {boolean} [options.nestTables] set to true to handle overlapping column names.
 * @param {boolean} [options.timeout] inactivity timeout in millis.
 * @returns {Promise} resolving to the query results.
 * @private
 */
Database.prototype._query = function (sql, params, options) {
  var self = this, resolver;

  options = options || {};

  resolver = function (resolve, reject) {
    self.acquireClient(function (err, client) {
      if (err) return reject(err);

      sql = _.assign({sql: sql}, options);

      client.query(sql, params, function(err, records) {
        var data;

        self.releaseClient(client);

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
 * Extracts and returns meta-data from database.
 * @returns {Promise} resolving to a meta-data object.
 * @private
 *
 * @example output
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
Database.prototype._extractMeta = function () {
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
    result.columns.forEach(function (e) {
      var table = meta[e.table];

      table.columns[e.name] = {
        type: e.type,
        position: e.position,
        isNullable: e.isNullable,
        isAutoInc: e.isAutoInc,
        default: e.default,
        collation: e.collation,
        comment: e.comment
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
Database.prototype._getTables = function () {
  var schema = this.connectionProperties.database,
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
Database.prototype._getColumns = function () {
  var re = /auto_increment/i, sql, params;

  sql = 'SELECT * FROM information_schema.COLUMNS WHERE table_schema = ?;';
  params = [this.connectionProperties.database];

  return this.query(sql, params).then(function (records) {
    return records.map(function (record) {
      return {
        name: record.COLUMN_NAME,
        table: record.TABLE_NAME,
        type: record.DATA_TYPE,
        isNullable: record.IS_NULLABLE === 'YES',
        isAutoInc: re.test(record.EXTRA),
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
Database.prototype._getIndices = function () {
  var sql, params;

  sql = 'SELECT * FROM information_schema.STATISTICS WHERE table_schema = ?;';
  params = [this.connectionProperties.database];

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
Database.prototype._getForeignKeys = function () {
  var schema = this.connectionProperties.database,
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

module.exports = Database;
