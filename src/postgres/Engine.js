var pg = require('pg.js'),
  createPool = require('generic-pool').Pool,
  Promise = require('bluebird'),
  querybuilder = require('./querybuilder');

/**
 * Constructs a new Postgres database Engine.
 * @param {object} options connection options.
 * @param {string} options.host the hostname of the database.
 * @param {String|Number} options.port the port number of the database.
 * @param {string} options.user the user to authenticate to the database.
 * @param {string} options.password the password of the user.
 * @param {string} options.database the name of the database, a.k.a. the schema.
 * @param {number} [options.poolSize=10] number of unique Client objects to maintain in the pool.
 * @param {number} [options.poolIdleTimeout=30000] max milliseconds a client can go unused before it is removed from the pool and destroyed.
 * @param {number} [options.reapIntervalMillis=1000] frequency to check for idle clients within the client pool.
 * @see {@link https://github.com/brianc/node-postgres/wiki/Client#constructor} for a list of connection options to use.
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
    self._pool = createPool({

      create: function(callback) {
        var client = new pg.Client(self._options);

        client.connect(function (err) {
          if (err) return callback(err);
          callback(null, client);
        });
      },

      destroy: function(client) {
        client.end();
      },

      min: 2,
      max: self._options.poolSize || 10,
      idleTimeoutMillis: self._options.poolIdleTimeout || 30000,
      reapIntervalMillis: self._options.reapIntervalMillis || 1000
    });

    return;
  });
};

/**
 * Disconnects from database.
 * @returns {Promise}
 */
Engine.prototype.disconnect = function () {
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
Engine.prototype.acquireClient = function (callback) {
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
Engine.prototype.releaseClient = function (client) {
  this._pool.release(client);
};

/**
 * Converts "?" to "$1", "$2", etc, according to the order they appear in the given SQL statement.
 * This method provides a compatibility layer with MySQL engine, exposing a uniform language for params.
 * @param {string} sql a parameterized SQL statement, using "?" to denote param.
 * @return {string}
 */
Engine.prototype.prepareSQL = function (sql) {
  var re = /\?/g,
    i = 0;

  return sql.replace(re, function () {
    i++;
    return '$' + i;
  });
};

/**
 * Runs the given SQL statement.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} [options] query options - currently unused.
 * @returns {Promise} resolving to the query results.
 */
Engine.prototype.query = function (sql, params) {
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
 * Compiles and executes a SELECT query based on the supplied options.
 * @see {@link querybuilder#select} for a list of query options to use.
 * @param {object} options query properties.
 * @returns {Promise}
 */
Engine.prototype.select = function (options) {
  var self = this;

  return Promise.try(function () {
    var q = querybuilder.select(options);
    return self.query(q.sql, q.params);
  });
};

/**
 * Compiles and executes a SELECT COUNT query based on the supplied options.
 * @see {@link querybuilder#count} for a list of query options to use.
 * @param {object} options query properties.
 * @returns {Promise}
 */
Engine.prototype.count = function (options) {
  var self = this;

  return Promise.try(function () {
    var q = querybuilder.count(options);
    return self.query(q.sql, q.params);
  });
};

/**
 * Compiles and executes a DELETE query based on the supplied options.
 * @see {@link querybuilder#delete} for a list of query options to use.
 * @param {object} options query properties.
 * @returns {Promise}
 */
Engine.prototype.delete = function (options) {
  var self = this;

  return Promise.try(function () {
    var q = querybuilder.delete(options);
    return self.query(q.sql, q.params);
  });
};

/**
 * Compiles and executes an UPSERT query based on the supplied options.
 * @see {@link querybuilder#upsert} for a list of query options to use.
 * @param {object} options query properties.
 * @returns {Promise}
 */
Engine.prototype.upsert = function (options) {
  var self = this;

  return Promise.try(function () {
    var q = querybuilder.upsert(options);
    return self.query(q.sql, q.params);
  });
};

/**
 * Compiles and executes an UPSERT query based on the supplied options.
 * @see {@link querybuilder#insert} for a list of query options to use.
 * @param {object} options query properties.
 * @returns {Promise}
 */
Engine.prototype.insert = function (options) {
  var self = this;

  return Promise.try(function () {
    var q = querybuilder.insert(options);
    return self.query(q.sql, q.params);
  });
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
Engine.prototype._getTables = function () {
  var sql, params;

  sql = 'SELECT table_name FROM information_schema.tables ' +
    'WHERE table_type = \'BASE TABLE\' AND table_catalog = $1 ' +
    'AND table_schema NOT IN (\'pg_catalog\', \'information_schema\');';
  params = [this._options.database];

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
Engine.prototype._getColumns = function () {
  var sql, params;

  sql = 'SELECT column_name, table_name, data_type, is_nullable, column_default, collation_name, ordinal_position ' +
    'FROM information_schema.columns ' +
    'WHERE table_catalog = $1 AND table_schema NOT IN (\'pg_catalog\', \'information_schema\');';
  params = [this._options.database];

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
Engine.prototype._getConstraints = function () {
  var sql, params;

  sql = 'SELECT tc.constraint_name, tc.constraint_type, ccu.table_name, ccu.column_name ' +
    'FROM information_schema.table_constraints AS tc ' +
    'INNER JOIN information_schema.constraint_column_usage AS ccu ON tc.constraint_name = ccu.constraint_name ' +
    'WHERE tc.constraint_catalog = $1;';
  params = [this._options.database];

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
Engine.prototype._getForeignKeys = function () {
  var sql, params;

  sql = 'SELECT tc.constraint_name, tc.table_name, kcu.column_name, ' +
    'ccu.table_name AS referenced_table_name, ' +
    'ccu.column_name AS referenced_column_name ' +
    'FROM information_schema.table_constraints AS tc ' +
    'INNER JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name ' +
    'INNER JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name ' +
    'WHERE tc.constraint_type = \'FOREIGN KEY\' AND tc.constraint_catalog = $1;';
  params = [this._options.database];

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

module.exports = Engine;
