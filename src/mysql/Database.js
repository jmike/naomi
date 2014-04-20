var mysql = require('mysql'),
  _ = require('lodash'),
  Model = require('./Model');

/**
 * Constructs a new MySQL database.
 * @param {Object} connectionProperties connection properties.
 * @see https://github.com/felixge/node-mysql#connection-options for a list of connection properties.
 * @constructor
 */
function Database(connectionProperties) {
  this.connectionProperties = connectionProperties;
  this.connected = false;
}

/**
 * Attempts to connect to database, using the connection properties given at construction time.
 * @param {Function} [callback] a callback function to execute when connection has been established, i.e. function (error) {}.
 * @returns {Database} this to enable method chaining.
 */
Database.prototype.connect = function (callback) {
  if (!this.connected) {
    this.pool = mysql.createPool(this.connectionProperties);
    this.connected = true;
  }

  if (callback) callback();

  return this;
};

/**
 * Gracefully closes all database connections.
 * The instance will become practically useless after calling this method, unless calling connect() again.
 * @param {Function} [callback] a callback function to execute when connection has been closed, i.e. function (error) {}.
 * @returns {Database} this to enable method chaining.
 */
Database.prototype.disconnect = function (callback) {
  if (this.connected) {
    this.pool.end(callback);
    this.connected = false;
  } else if (callback) {
    callback();
  }

  return this;
};

/**
 * Runs the given SQL statement to the database.
 * @param {String} sql a parameterized SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {Object} [options] query options, i.e. {nestTables: true} to handle overlapping column names.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Database.prototype.query = function (sql, params, options, callback) {
  // handle optional "params"
  if (! Array.isArray(params)) {
    if (typeof params === 'function') {
      callback = params;
    } else { // is object
      options = params;
    }
    params = [];
  }

  // handle optional "options"
  if (typeof options === 'function') {
    callback = options;
    options = null;
  } else { // is object
    options.sql = sql;
    sql = options;
  }

  // query the db
  this.pool.getConnection(function (error, connection) {
    if (error) return callback(error);

    connection.query(sql, params, function(error, data) {
      connection.release(); // no longer needed
      callback(error, data);
    });
  });
};

/**
 * Creates and returns a new database model.
 * @param {String} table the name of an existing table in database.
 * @param {Object} [customProperties] the model's custom properties.
 * Please note that this function will not create a new table on database.
 */
Database.prototype.extend = function (table, customProperties) {
  var model = new Model(this, table);

  if (_.isPlainObject(customProperties)) {
    return _.extend(model, customProperties);
  }

  return model;
};

module.exports = Database;
