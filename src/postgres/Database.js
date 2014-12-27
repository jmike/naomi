var util = require('util');
var pg = require('pg.js');
var createPool = require('generic-pool').Pool;
var Promise = require('bluebird');
var Joi = require('joi');
var GenericDatabase = require('../Database');
var Table = require('./Table');
var Transaction = require('./Transaction');

var propsSchema = Joi.object()
  .label('connection properties')
  .keys({
    host: Joi.string().label('host').hostname().strict().optional().default('localhost'),
    port: Joi.number().label('port').min(0).max(65536).optional().default(5432),
    user: Joi.string().label('user').strict().optional().default('root'),
    password: Joi.string().label('password').strict().optional().default('').allow(''),
    database: Joi.string().label('database name').strict().required(),
    connectionLimit: Joi.number().label('connection limit').min(1).max(1000).strict().optional().default(10),
    poolIdleTimeout: Joi.number().min(1000).strict().optional().default(30000),
    reapIntervalMillis: Joi.number().min(1000).strict().optional().default(1000)
  });

/**
 * Constructs a new Postgres Database.
 * @param {object} props connection properties.
 * @param {string} props.database the name of the database.
 * @param {string} [props.host=localhost] the hostname of the database.
 * @param {(string|number)} [props.port] the port number of the database.
 * @param {string} [props.user=root] the user to access the database.
 * @param {string} [props.password] the password of the user.
 * @param {number} [props.connectionLimit=10] number maximum number of connections to maintain in the pool.
 * @extends {GenericDatabase}
 * @constructor
 */
function Database(props) {
  var validationResult;

  // validate connection properties
  validationResult = Joi.validate(props, propsSchema);

  if (validationResult.error) throw validationResult.error;
  props = validationResult.value;

  GenericDatabase.call(this, props);
  this._pool = null;
}

// @extends GenericDatabase
util.inherits(Database, GenericDatabase);

// associate with Postgres Table class
Database.prototype.Table = Table;

// associate with Postgres Transaction class
Database.prototype.Transaction = Transaction;

/**
 * Attempts to connect to database server using the connection properties supplied at construction time.
 * @param {function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 * @emits Database#connect
 */
Database.prototype.connect = function (callback) {
  var _this = this;

  if (this.isConnected) Promise.resolve().nodeify(callback); // already connected

  return Promise.try(function () {
    _this._pool = createPool({
      create: function(callback) {
        var client = new pg.Client(_this.connectionProperties);

        client.connect(function (err) {
          if (err) return callback(err);
          callback(null, client);
        });
      },
      destroy: function(client) {
        client.end();
      },
      min: 1,
      max: _this.connectionProperties.poolSize,
      idleTimeoutMillis: _this.connectionProperties.poolIdleTimeout,
      reapIntervalMillis: _this.connectionProperties.reapIntervalMillis
    });
  })
    .then(function () {
      return GenericDatabase.prototype.connect.call(_this, callback);
    });
};

/**
 * Gracefully closes any open connection to the database server.
 * Please note: this instance will become practically useless after calling this method.
 * @param {function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 * @emits Database#disconnect
 */
Database.prototype.disconnect = function (callback) {
  var _this = this;

  if (!this.isConnected) return Promise.resolve().nodeify(callback); // already disconnected

  return Promise.try(function () {
    _this._pool.drain(function () {
      _this._pool.destroyAllNow();
    });
  })
    .then(function () {
      return GenericDatabase.prototype.disconnect.call(_this, callback);
    });
};

/**
 * Acquires the first available client from pool.
 * @param {function} [callback] an optional callback function.
 * @return {Promise} resolving to client.
 */
Database.prototype.acquireClient = function (callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve, reject) {
    _this._pool.acquire(function(err, client) {
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
 * Executes the given parameterized SQL statement, using the supplied db client.
 * @param {Client} client a db client.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @returns {Promise} resolving to the query results.
 * @private
 */
Database.prototype._exec = function (client, sql, params) {
  var resolver;

  resolver = function (resolve, reject) {
    client.query(sql, params, function(err, result) {
      if (err) return reject(err);
      resolve(result.rows);
    });
  };

  return new Promise(resolver);
};

/**
 * Converts ? chars to $1, $2, etc, according to the order they appear in the given SQL statement.
 * This method provides a compatibility layer with MySQL engine, exposing a uniform syntax for params.
 * @param {string} sql a parameterized SQL statement, using "?" to denote param.
 * @return {string}
 */
Database.prototype.prepareSQL = function (sql) {
  var re = /\?/g;
  var i = 0;

  return sql.replace(re, function () {
    i++;
    return '$' + i;
  });
};

/**
 * Runs the given SQL statement to the database server.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} [options] query options.
 * @param {function} [callback] a callback function, i.e. function(err, records).
 * @returns {Promise} resolving to the query results.
 */
Database.prototype.query = function (sql, params, options, callback) {
  var _this = this;

  return _this._normalizeQueryParams(sql, params, options, callback)
    .spread(function (sql, params, options, callback) {
      return _this.acquireClient()
        .then(function (client) {
          sql = _this.prepareSQL(sql);

          return _this._exec(client, sql, params)
            .finally(function () {
              return _this.releaseClient(client);
            });
        })
        .nodeify(callback);
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
  var sql;
  var params;

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
  var sql;
  var params;

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
  var sql;
  var params;

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
  var sql;
  var params;

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

module.exports = Database;
