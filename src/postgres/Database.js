var pg = require('pg.js'),
  createPool = require('generic-pool').Pool,
  Promise = require('bluebird'),
  GenericDatabase = require('../Database'),
  Table = require('./Table'),
  Transaction = require('./Transaction');

/**
 * Constructs a new Postgres Database.
 * @extends {GenericDatabase}
 * @constructor
 */
function Database() {
  this._pool = null;
  GenericDatabase.apply(this, arguments);
}

// Database extends GenericDatabase
Database.prototype = Object.create(GenericDatabase.prototype);

/**
 * Attempts to connect to database server using the connection properties supplied at construction time.
 * @returns {Promise}
 * @private
 */
Database.prototype._connect = function () {
  var self = this;

  return Promise.try(function () {
    self._pool = createPool({

      create: function(callback) {
        var client = new pg.Client(self.connectionProperties);

        client.connect(function (err) {
          if (err) return callback(err);
          callback(null, client);
        });
      },

      destroy: function(client) {
        client.end();
      },

      min: 2,
      max: self.connectionProperties.poolSize,
      idleTimeoutMillis: self.connectionProperties.poolIdleTimeout,
      reapIntervalMillis: self.connectionProperties.reapIntervalMillis
    });

    return;
  });
};

/**
 * Gracefully closes any open connection to the database server.
 * @returns {Promise}
 * @private
 */
Database.prototype._disconnect = function () {
  var self = this;

  return Promise.try(function () {
    self._pool.drain(function () {
      self._pool.destroyAllNow();
    });
    return;
  });
};

/**
 * Acquires the first available client from pool.
 * @param {function} [callback] an optional callback function.
 * @return {Promise} resolving to client.
 */
Database.prototype.acquireClient = function (callback) {
  var self = this, resolver;

  resolver = function (resolve, reject) {
    self._pool.acquire(function(err, client) {
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
  this._pool.release(client);
};


/**
 * Converts "?" to "$1", "$2", etc, according to the order they appear in the given SQL statement.
 * This method provides a compatibility layer with MySQL engine, exposing a uniform language for params.
 * @param {string} sql a parameterized SQL statement, using "?" to denote param.
 * @return {string}
 */
Database.prototype.prepareSQL = function (sql) {
  var re = /\?/g,
    i = 0;

  return sql.replace(re, function () {
    i++;
    return '$' + i;
  });
};

/**
 * Runs the given SQL statement to the database server.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @returns {Promise} resolving to the query results.
 * @private
 */
Database.prototype._query = function (sql, params) {
  var self = this, resolver;

  sql = this.prepareSQL(sql);

  resolver = function (resolve, reject) {
    self.acquireClient(function(err, client) {
      if (err) return reject(err);

      client.query(sql, params, function(err, result) {
        self.releaseClient(client);

        if (err) {
          reject(err);
        } else {
          resolve(result.rows);
        }
      });
    });
  };

  return new Promise(resolver);
};

/**
 * Begins a new transaction with this database.
 * @returns {Promise} resolving to a new Transaction instance.
 * @private
 */
Database.prototype._beginTransaction = function () {
  var t = new Transaction(this);
  return t.begin().then(function () {
    return t;
  });
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
    constraints: this._getConstraints(),
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
    result.constraints.forEach(function (constraint) {
      var table = meta[constraint.table];

      if (constraint.type === 'PRIMARY KEY') {
        table.primaryKey.push(constraint.column);

      } else if (constraint.type === 'UNIQUE') {
        table.uniqueKeys[constraint.key] = table.uniqueKeys[constraint.key] || [];
        table.uniqueKeys[constraint.key].push(constraint.column);
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
  var sql, params;

  sql = 'SELECT table_name FROM information_schema.tables ' +
    'WHERE table_type = \'BASE TABLE\' AND table_catalog = $1 ' +
    'AND table_schema NOT IN (\'pg_catalog\', \'information_schema\');';
  params = [this.connectionProperties.database];

  return this.query(sql, params).then(function (records) {
    return records.map(function (record) {
      return record.table_name;
    });
  });
};

/**
 * Retrieves column properties from database.
 * @returns {Promise}
 * @private
 */
Database.prototype._getColumns = function () {
  var sql, params;

  sql = 'SELECT column_name, table_name, data_type, is_nullable, column_default, collation_name, ordinal_position ' +
    'FROM information_schema.columns ' +
    'WHERE table_catalog = $1 AND table_schema NOT IN (\'pg_catalog\', \'information_schema\');';
  params = [this.connectionProperties.database];

  return this.query(sql, params).then(function (records) {
    return records.map(function (record) {
      return {
        name: record.column_name,
        table: record.table_name,
        type: record.data_type,
        isNullable: record.is_nullable === 'YES',
        default: record.column_default,
        collation: record.collation_name,
        comment: '', // TODO: extract comments
        position: record.ordinal_position - 1 // zero-indexed
      };
    });
  });
};

/**
 * Retrieves constraint properties from database.
 * @returns {Promise}
 * @private
 */
Database.prototype._getConstraints = function () {
  var sql, params;

  sql = 'SELECT tc.constraint_name, tc.constraint_type, ccu.table_name, ccu.column_name ' +
    'FROM information_schema.table_constraints AS tc ' +
    'INNER JOIN information_schema.constraint_column_usage AS ccu ON tc.constraint_name = ccu.constraint_name ' +
    'WHERE tc.constraint_catalog = $1;';
  params = [this.connectionProperties.database];

  return this.query(sql, params).then(function (records) {
    return records.map(function (record) {
      return {
        key: record.constraint_name,
        table: record.table_name,
        column: record.column_name,
        type: record.constraint_type
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
  var sql, params;

  sql = 'SELECT tc.constraint_name, tc.table_name, kcu.column_name, ' +
    'ccu.table_name AS referenced_table_name, ' +
    'ccu.column_name AS referenced_column_name ' +
    'FROM information_schema.table_constraints AS tc ' +
    'INNER JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name ' +
    'INNER JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name ' +
    'WHERE tc.constraint_type = \'FOREIGN KEY\' AND tc.constraint_catalog = $1;';
  params = [this.connectionProperties.database];

  return this.query(sql, params, {}).then(function (records) {
    return records.map(function (record) {
      return {
        key: record.constraint_name,
        table: record.table_name,
        column: record.column_name,
        refTable: record.referenced_table_name,
        refColumn: record.referenced_column_name
      };
    });
  });
};

/**
 * Creates and returns a new Table of the given name.
 * @param {string} tableName the name of the table in database.
 * @returns {Table}
 * @private
 */
Database.prototype._createTable = function (tableName) {
  return new Table(this, tableName);
};

module.exports = Database;
