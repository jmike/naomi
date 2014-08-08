var mysql = require('mysql'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  QueryBuilder = require('./mysql/QueryBuilder');

/**
 * Constructs a new MySQL database Engine.
 * @param {Object} options connection options.
 * @param {String} options.host the hostname of the database.
 * @param {String|Number} options.port the port number of the database.
 * @param {String} options.user the user to authenticate to the database.
 * @param {String} options.password the password of the user.
 * @param {String} options.database the name of the database, a.k.a. the schema.
 * @see {@link https://github.com/felixge/node-mysql#connection-options} for a list of connection options to use.
 * @constructor
 */
function Engine(options) {
  this._options = options;
}

/**
 * Returns a query builder object to easily compose common MySQL queries.
 * @returns {QueryBuilder}
 */
Engine.prototype.getQueryBuilder = function () {
  return QueryBuilder;
};

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
  var self = this,
    resolver;

  resolver = function (resolve, reject) {
    self._pool.end(function (err) {
      if (err) return reject(err);

      resolve();
    });
  };

  return new Promise(resolver);
};


/**
 * Runs the given SQL statement to the database.
 * @param {String} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {Object} options query options.
 * @param {Boolean} [options.nestTables=false] set to true to handle overlapping column names.
 * @returns {Promise}
 */
Engine.prototype.query = function (sql, params, options) {
  var self = this,
    resolver;

  resolver = function (resolve, reject) {
    self._pool.getConnection(function (err, connection) {
      if (err) return reject(err);

      if (options.nestTables) {
        sql = {
          sql: sql,
          nestTables: options.nestTables
        };
      }

      connection.query(sql, params, function(err, records) {
        var data;

        connection.release(); // always

        if (err) return reject(err);

        if (_.isArray(records)) return resolve(records); // SELECT statement

        // DML statement
        data = {
          insertId: records.insertId,
          affectedRows: records.affectedRows
        };

        resolve(data);

      });
    });
  };

  return new Promise(resolver);
};

/**
 * Retrieves tables from database.
 * @returns {Promise}
 */
Engine.prototype.getTables = function () {
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
 * Retrieves columns from database.
 * @returns {Promise}
 */
Engine.prototype.getColumns = function () {
  var schema = this._options.database,
    sql, params;

  sql = 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = ?;';
  params = [schema];

  return this.query(sql, params, {}).then(function (records) {
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
 * Retrieves indices from database.
 * @returns {Promise}
 */
Engine.prototype.getIndices = function () {
  var schema = this._options.database,
    sql, params;

  sql = 'SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE table_schema = ?;';
  params = [schema];

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
 * Retrieves foreign keys from database.
 * @returns {Promise}
 */
Engine.prototype.getForeignKeys = function () {
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
