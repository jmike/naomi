var pg = require('pg.js'),
  _ = require('lodash'),
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
 * @param {Function} callback a callback function to execute when connection has been established, i.e. function (err).
 */
Engine.prototype.connect = function (callback) {
  this._pool = mysql.createPool(this.connectionProperties);
  callback();
};

/**
 * Disconnects from database server.
 * @param {Function} callback a callback function to execute when connection has been closed, i.e. function (err).
 * @returns {Database} this to enable method chaining.
 */
Engine.prototype.disconnect = function (callback) {
  this._pool.end(callback);
};


/**
 * Runs the given SQL statement to the database server.
 * @param {String} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {Object} options query options, i.e. {nestTables: true} to handle overlapping column names.
 * @param {Function} callback a callback function, i.e. function(error, records, meta) for SELECT statements and function(error, meta) for DML statements.
 */
Engine.prototype.query = function (sql, params, options, callback) {
  this._pool.getConnection(function (err, connection) {
    if (err) return callback(err);

    if (options.nestTables) {
      sql = {
        sql: sql,
        nestTables: options.nestTables
      };
    }

    connection.query(sql, params, function(error, records) {
      var meta;

      if (error) {
        callback(error);

      } else if (_.isArray(records)) { // Select statement
        callback(null, records);

      } else { // DML statement
        meta = {
          insertId: records.insertId,
          affectedRows: records.affectedRows
        };
        callback(null, meta);
      }

      connection.release();
    });
  });
};

/**
 * Returns the name of the tables of the database schema specified at construction time.
 * @param {Function} callback a callback function i.e. function(err, tables).
 * @returns {Array<String>}
 */
Engine.prototype.getTables = function (callback) {
  var schema = this.connectionProperties.database,
    sql, params;

  sql = 'SHOW FULL TABLES FROM ??;';
  params = [schema];

  this.query(sql, params, {}, function (err, records) {
    var tables;

    if (err) return callback(err);

    tables = records.filter(function (record) {
      return record.Table_type === 'BASE TABLE';
    }).map(function (record) {
      return record['Tables_in_' + schema];
    });

    callback(null, tables);
  });
};


/**
 * Returns column properties from the database schema specified at construction time.
 * @param {Function} callback a callback function i.e. function(err, columns).
 * @returns {Array<Object>}
 */
Engine.prototype.getColumns = function (callback) {
  var schema = this.connectionProperties.database,
    sql, params;

  sql = 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = ?;';
  params = [schema];

  this.query(sql, params, {}, function (err, records) {
    var columns;

    if (err) return callback(err);

    columns = records.map(function (record) {
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

    callback(null, columns);
  });
};

/**
 * Returns index properties from the database schema specified at construction time.
 * @param {Function} callback a callback function i.e. function(err, indices).
 * @returns {Array<Object>}
 */
Engine.prototype.getIndices = function (callback) {
  var schema = this.connectionProperties.database,
    sql, params;

  sql = 'SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = ?;';
  params = [schema];

  this.query(sql, params, {}, function (err, records) {
    var indices;

    if (err) return callback(err);

    indices = records.map(function (record) {
      return {
        key: record.INDEX_NAME,
        table: record.TABLE_NAME,
        column: record.COLUMN_NAME,
        isUnique: record.NON_UNIQUE === 0
      };
    });

    callback(null, indices);
  });
};

/**
 * Returns foreign key properties from the database schema specified at construction time.
 * @param {Function} callback a callback function i.e. function(err, constraints).
 * @returns {Array<Object>}
 */
Engine.prototype.getForeignKeys = function (callback) {
  var schema = this.connectionProperties.database,
    sql, params;

  sql = 'SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_SCHEMA = ?;';
  params = [schema, schema];

  this.query(sql, params, {}, function (err, records) {
    var foreignKeys;

    if (err) return callback(err);

    foreignKeys = records.map(function (record) {
      return {
        key: record.CONSTRAINT_NAME,
        table: record.TABLE_NAME,
        column: record.COLUMN_NAME,
        refTable: record.REFERENCED_TABLE_NAME,
        refColumn: record.REFERENCED_COLUMN_NAME
      };
    });

    callback(null, foreignKeys);
  });
};

module.exports = Engine;
