var mysql = require('mysql'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  QueryBuilder = require('./QueryBuilder');

/**
 * Constructs a new MySQL engine, i.e. a handy wrapper to MySQL Node.js client.
 * @param {Object} connectionProperties connection properties.
 * @see https://github.com/felixge/node-mysql#connection-options for a list of connection properties to use.
 * @constructor
 */
function Engine(connectionProperties) {
  this.connectionProperties = connectionProperties;
  this.QueryBuilder = QueryBuilder;
}

/**
 * Connects to database server using the connection properties given at construction time.
 * @returns {Promise}
 */
Engine.prototype.connect = function () {
  var resolver = function (resolve) {
    this._pool = mysql.createPool(this.connectionProperties);
    resolve();
  }.bind(this);

  return new Promise(resolver);
};

/**
 * Disconnects from database server.
 * @returns {Promise}
 */
Engine.prototype.disconnect = function () {
  var resolver = function (resolve, reject) {
    this._pool.end(function (err) {
      if (err) return reject(err);
      resolve();
    });
  }.bind(this);

  return new Promise(resolver);
};


/**
 * Runs the given SQL statement to the database server.
 * @param {String} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {Object} options query options, i.e. {nestTables: true} to handle overlapping column names.
 * @returns {Promise}
 */
Engine.prototype.query = function (sql, params, options) {
  var resolver = function (resolve, reject) {
    this._pool.getConnection(function (err, connection) {
      if (err) return reject(err);

      if (options.nestTables) {
        sql = {
          sql: sql,
          nestTables: options.nestTables
        };
      }

      connection.query(sql, params, function(err, records) {
        var meta;

        if (err) {
          reject(err);

        } else if (_.isArray(records)) { // Select statement
          resolve(records);

        } else { // DML statement
          meta = {
            insertId: records.insertId,
            affectedRows: records.affectedRows
          };
          resolve(meta);
        }

        connection.release(); // always come to this
      });
    });
  }.bind(this);

  return new Promise(resolver);
};

/**
 * Returns the name of the tables of the database schema specified at construction time.
 * @returns {Promise}
 */
Engine.prototype.getTables = function () {
  var schema = this.connectionProperties.database,
    sql, params;

  sql = 'SHOW FULL TABLES FROM ??;';
  params = [schema];

  return this.query(sql, params, {})
    .then(function (records) {
      return records
        .filter(function (record) {
          return record.Table_type === 'BASE TABLE';
        })
        .map(function (record) {
          return record['Tables_in_' + schema];
        });
    });
};


/**
 * Returns column properties from the database schema specified at construction time.
 * @returns {Promise}
 */
Engine.prototype.getColumns = function () {
  var schema = this.connectionProperties.database,
    sql, params;

  sql = 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = ?;';
  params = [schema];

  return this.query(sql, params, {})
    .then(function (records) {
      return records.map(function (record) {
        return {
          name: record.COLUMN_NAME,
          table: record.TABLE_NAME,
          type: record.DATA_TYPE,
          isNullable: record.IS_NULLABLE === 'YES',
          default: record.COLUMN_DEFAULT,
          collation: record.COLLATION_NAME,
          comment: _.isEmpty(record.COLUMN_COMMENT) ? null : record.COLUMN_COMMENT,
          position: record.ORDINAL_POSITION - 1 // zero-indexed
        };
      });
    });
};

/**
 * Returns index properties from the database schema specified at construction time.
 * @returns {Promise}
 */
Engine.prototype.getIndices = function () {
  var schema = this.connectionProperties.database,
    sql, params;

  sql = 'SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = ?;';
  params = [schema];

  return this.query(sql, params, {})
    .then(function (records) {
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
 * Returns foreign key properties from the database schema specified at construction time.
 * @returns {Promise}
 */
Engine.prototype.getForeignKeys = function () {
  var schema = this.connectionProperties.database,
    sql, params;

  sql = 'SELECT * FROM information_schema.KEY_COLUMN_USAGE ' +
    'WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_SCHEMA = ?;';
  params = [schema, schema];

  return this.query(sql, params, {})
    .then(function (records) {
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
