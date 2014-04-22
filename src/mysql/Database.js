var mysql = require('mysql'),
  _ = require('lodash'),
  Collection = require('./Collection');

/**
 * Constructs a new MySQL database.
 * @param {Object} connectionProperties connection properties.
 * @see https://github.com/felixge/node-mysql#connection-options for a list of connection properties.
 * @constructor
 */
function Database(connectionProperties) {
  this.connectionProperties = connectionProperties;
  this.isConnected = false;
}

/**
 * Attempts to connect to database, using the connection properties given at construction time.
 * @param {Function} [callback] a callback function to execute when connection has been established, i.e. function (error) {}.
 * @returns {Database} this to enable method chaining.
 */
Database.prototype.connect = function (callback) {
  if (!this.isConnected) {
    this.pool = mysql.createPool(this.connectionProperties);
    this.isConnected = true;
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
  if (this.isConnected) {
    this.pool.end(callback);
    this.isConnected = false;
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
 * @param {Function} [callback] a callback function i.e. function(error, data).
 */
Database.prototype.query = function (sql, params, options, callback) {
  if (!_.isString(sql)) {
    throw new Error('You must specify a SQL statement');
  }

  if (!_.isArray(params)) {

    if (_.isFunction(params)) {
      callback = params;
    } else if (_.isPlainObject(params)) {
      options = params;
    } else if (!_.isUndefined(params)) {
      throw new Error('Invalid query parameters - expected array, received ' + typeof(callback));
    }

    params = []; // default
  }

  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      throw new Error('Invalid query options - expected object, received ' + typeof(callback));
    }

    options = null; // default
  }

  if (!_.isFunction(callback)) {

    if (!_.isUndefined(callback)) {
      throw new Error('You must specify a proper callback function');
    }

    // default
    callback = function (error) {
      if (error) throw error;
    };
  }

  // make sure db is isConnected
  if (!this.isConnected) {
    return callback(new Error('Connection is closed - did you forget to call db.connect()?'));
  }

  // use options
  if (options) {
    sql = _.extend(options, {sql: sql});
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
 * Creates and returns a new data collection representing the designated table.
 * @param {String} table the name of an existing table in database.
 * @param {Object} [customProperties] the collection's custom properties.
 * Please note that this function will not create a new table on database.
 */
Database.prototype.extend = function (table, customProperties) {
  var collection = new Collection(this, table);

  if (_.isPlainObject(customProperties)) {
    return _.extend(collection, customProperties);
  } else if (!_.isUndefined(customProperties)) {
    throw new Error('Invalid custom properties - expected object, received ' + typeof(customProperties));
  }

  return collection;
};

module.exports = Database;
