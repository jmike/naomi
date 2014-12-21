var util = require('util');
var mysql = require('mysql');
var _ = require('lodash');
var Joi = require('joi');
var Promise = require('bluebird');
var GenericDatabase = require('../Database');
var Table = require('./Table');
var Transaction = require('./Transaction');

var propsSchema = Joi.object()
  .label('connection properties')
  .keys({
    host: Joi.string().label('host').hostname().strict().optional().default('localhost'),
    port: Joi.number().label('port').min(0).max(65536).optional().default(3306),
    user: Joi.string().label('user').strict().optional().default('root'),
    password: Joi.string().label('password').strict().optional().default('').allow(''),
    database: Joi.string().label('database name').strict().required(),
    connectionLimit: Joi.number().label('connection limit').min(1).max(1000).strict().optional().default(10),
  });

/**
 * Constructs a new MySQL Database of the designated properties.
 * @param {object} props connection properties.
 * @param {string} [props.host=localhost] the hostname of the database.
 * @param {number} [props.port=3306] the port number of the database.
 * @param {string} [props.user=root] the user to access the database.
 * @param {string} props.password the password of the user.
 * @param {string} props.database the name of the database.
 * @param {number} [props.connectionLimit=10] number maximum number of connections to maintain in the pool.
 * @throws {Error} if params are invalid or unspecified.
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

// associate with MySQL Table class
Database.prototype.Table = Table;

// associate with MySQL Transaction class
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
    _this._pool = mysql.createPool(_this.connectionProperties);
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
Database.prototype._disconnect = function (callback) {
  var _this = this;
  var resolver;

  if (!this.isConnected) return Promise.resolve().nodeify(callback); // already disconnected

  resolver = function (resolve, reject) {
    _this._pool.end(function (err) {
      if (err) return reject(err);
      resolve();
    });
  };

  return new Promise(resolver)
    .then(function () {
      return GenericDatabase.prototype.disconnect.call(_this, callback);
    });
};

/**
 * Acquires the first available client from pool.
 * @param {function} [callback] an optional callback function with (err, client) arguments.
 * @return {Promise} resolving to client.
 */
Database.prototype.acquireClient = function (callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve, reject) {
    _this._pool.getConnection(function (err, client) {
      if (err) return reject(err);
      resolve(client);
    });
  };

  return new Promise(resolver).nodeify(callback);
};

/**
 * Releases the designated client to pool.
 * @param {Client} client
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
  var _this = this;
  var resolver;

  options = options || {};

  resolver = function (resolve, reject) {
    _this.acquireClient(function (err, client) {
      if (err) return reject(err);

      sql = _.assign({sql: sql}, options);

      client.query(sql, params, function(err, records) {
        var data;

        _this.releaseClient(client);

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
  var schema = this.connectionProperties.database;
  var sql;
  var params;

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
  var re = /auto_increment/i;
  var sql;
  var params;

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
  var sql;
  var params;

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
  var schema = this.connectionProperties.database;
  var sql;
  var params;

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
