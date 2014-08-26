var events = require('events'),
  util = require('util'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  MySQLEngine = require('./mysql/Engine'),
  PostgresEngine = require('./postgres/Engine'),
  Table = require('./Table');

/**
 * Constructs a new database of the designated properties.
 * Please note: additional connection properties may apply depending on the database type.
 * @see {@link https://github.com/felixge/node-mysql#connection-options} for MySQL additional properties.
 * @see {@link https://github.com/brianc/node-postgres/wiki/Client#constructor} for Postgres additional properties.
 * @param {object} props connection properties.
 * @param {string} props.type the database type, i.e. "mysql", "postgres".
 * @param {string} [props.host] the hostname of the database.
 * @param {(string|number)} [props.port] the port number of the database.
 * @param {string} [props.user] the user to access the database.
 * @param {string} [props.password] the password of the user.
 * @param {string} [props.database] the name of the database.
 * @returns {Database}
 * @throws {Error} if params are invalid or unspecified.
 * @static
 */
function Database(props) {
  var engine, type;

  // validate "props" param
  if (!_.isPlainObject(props)) {
    throw new Error('Invalid connection properties: expected plain object, received ' + props);
  }

  // extract + validate "type" option
  type = props.type;

  if (!_.isString(type)) {
    throw new Error('Invalid or unspecified database type');
  }

  // init database engine
  if (/mysql/i.test(type)) {
    engine = new MySQLEngine(props);
  } else if (/postgres/i.test(type)) {
    engine = new PostgresEngine(props);
  } else {
    throw new Error('Unknown database type: expected "mysql" or "postgres", received "' + type + '"');
  }

  // set database public properties
  this.type = type;
  this.isConnected = false;
  this.isReady = false;

  // set database private properties
  this._engine = engine;
  this._meta = {};

  // init the EventEmitter
  events.EventEmitter.call(this);
  this.setMaxListeners(99);

  // load metadata from database server
  this.on('connect', function () {
    engine.getMeta()
      .bind(this)
      .then(function (meta) {
        this._meta = meta;
        this.isReady = true;
        this.emit('ready');
      });
  });
}

// Database extends the EventEmitter class
util.inherits(Database, events.EventEmitter);

/**
 * Attempts to connect to database server using the connection properties supplied at construction time.
 * @param {function} [callback] an optional callback function, i.e. function (err) {}.
 * @returns {Promise}
 * @emits Database#connect
 */
Database.prototype.connect = function (callback) {
  if (this.isConnected) { // already connected
    return Promise.resolve().nodeify(callback);
  }

  return this._engine.connect()
    .bind(this)
    .then(function () {
      this.isConnected = true;
      this.emit('connect');
      return;
    })
    .nodeify(callback);
};

/**
 * Gracefully closes any open connection to the database server.
 * Please note: this instance will become practically useless after calling this method.
 * @param {function} [callback] an optional callback function, i.e. function (err) {}.
 * @returns {Promise}
 * @emits Database#disconnect
 */
Database.prototype.disconnect = function (callback) {
  if (!this.isConnected) { // already disconnected
    return Promise.resolve().nodeify(callback);
  }

  this._engine.disconnect()
    .bind(this)
    .then(function () {
      this.isConnected = false;
      this.isReady = false;
      this.emit('disconnect');
      return;
    })
    .nodeify(callback);
};

/**
 * Runs the given SQL statement to the database server.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {object} [options] query options.
 * @param {function} [callback] a callback function, i.e. function(err, records).
 * @returns {Promise} resolving to the query results.
 */
Database.prototype.query = function (sql, params, options, callback) {
  // validate "sql" param
  if (!_.isString(sql)) {
    return Promise.reject('Invalid SQL statement: expected string, received ' + typeof(sql)).nodeify(callback);
  }

  // handle optional "params" param
  if (!_.isArray(params)) {

    if (_.isPlainObject(params)) {
      options = params;
    } else if (_.isFunction(params)) {
      options = undefined;
      callback = params;
    } else if (!_.isUndefined(params)) {
      return Promise.reject('Invalid query parameters: expected Array, received ' + typeof(params)).nodeify(callback);
    }

    params = [];
  }

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid query options: expected plain object, received ' + typeof(options)).nodeify(callback);
    }

    options = {};
  }

  // make sure db is connected
  if (!this.isConnected) {
    return Promise.reject('Connection is closed - did you forget to call #connect()?').nodeify(callback);
  }

  // execute the query
  return this._engine.query(sql, params, options).nodeify(callback);
};

/**
 * Compiles and executes a SELECT query based on the supplied properties.
 * @param {object} props query properties.
 * @param {string} props.table the name of the table to select records from.
 * @param {Array.<string>} [props.columns] an array of columns to return.
 * @param {(object|Array.<object>)} [props.selector] a selector object to match specific records.
 * @param {(object|Array.<object>)} [props.order] an order object to sort records.
 * @param {number} [props.limit] max number of records to return - must be a positive integer, i.e. limit > 0.
 * @param {number} [props.offset] number of records to skip - must be a non-negative integer, i.e. offset >= 0.
 * @returns {Promise}
 */
Database.prototype.select = function (props) {
  return this._engine.select(props);
};

/**
 * Compiles and executes a SELECT COUNT query based on the supplied properties.
 * @param {object} props query properties.
 * @param {string} props.table the name of the table to count records from.
 * @param {(object|Array.<object>)} [props.selector] a selector object to match specific records.
 * @param {number} [props.limit] max number of records to return - must be a positive integer, i.e. limit > 0.
 * @param {number} [props.offset] number of records to skip - must be a non-negative integer, i.e. offset >= 0.
 * @returns {Promise}
 */
Database.prototype.count = function (props) {
  return this._engine.count(props);
};

/**
 * Compiles and executes a DELETE query based on the supplied properties.
 * @param {object} props query properties.
 * @param {string} props.table the name of the table to delete records from.
 * @param {(object|Array.<object>)} [props.selector] a selector object to match specific records.
 * @param {(object|Array.<object>)} [props.order] an order object to sort records.
 * @param {number} [props.limit] max number of records to return - must be a positive integer, i.e. limit > 0.
 * @returns {Promise}
 */
Database.prototype.delete = function (props) {
  return this._engine.delete(props);
};

/**
 * Compiles and executes an UPSERT, i.e. update if exists or insert, query based on the supplied properties.
 * @param {object} props query properties.
 * @param {string} props.table the name of the table to upsert records to.
 * @param {object} props.values values to upsert.
 * @param {Array.<string>} [props.updateColumns] columns to update if record already exists - defaults to all columns.
 * @param {Array.<object>} [props.updateSelector] selector to test if records exists.
 * @returns {Promise}
 */
Database.prototype.upsert = function (props) {
  return this._engine.upsert(props);
};

/**
 * Compiles and executes an INSERT query based on the supplied properties.
 * @param {object} props query properties.
 * @param {string} props.table the name of the table to insert records to.
 * @param {object} props.values values to insert.
 * @returns {Promise}
 */
Database.prototype.insert = function (props) {
  return this._engine.insert(props);
};

/**
 * Initiates a new transaction.
 * @param {function} [callback] a callback function.
 * @returns {Promise} resolving to a new Transaction instance.
 */
Database.prototype.beginTransaction = function (callback) {
  return this._engine.beginTransaction().nodeify(callback);
};

/**
 * Indicates whether the designated table exists in database.
 * Please note: this method will always return false until the database is ready.
 * @param {string} tableName the name of the table.
 * @returns {boolean}
 */
Database.prototype.hasTable = function (tableName) {
  return this.isReady && this._meta.hasOwnProperty(tableName);
};

/**
 * Returns the designated table's metadata.
 * Please note: this method will always return null until the database is ready.
 * @param {string} tableName the name of the table.
 * @returns {(object|null)}
 */
Database.prototype.getTableMeta = function (tableName) {
  return this._meta[tableName] || null;
};

/**
 * Returns a new Table, extended with the given properties and methods.
 * Please note: this method will not create a new table on database - it will merely reference an existing one.
 * @param {string} tableName the name of the table in database.
 * @param {object} [customProperties] the table's custom properties and methods.
 * @returns {Table}
 */
Database.prototype.extend = function (tableName, customProperties) {
  var table;

  // validate "tableName" param
  if (!_.isString(tableName)) {
    throw new Error('Invalid table name: expected string, received ' + typeof(tableName));
  }

  // create table
  table = new Table(this, tableName);

  // extend with custom properties
  if (_.isPlainObject(customProperties)) {
    table = _.extend(table, customProperties);
  }

  return table;
};

/**
 * Returns the shortest path from table A to table B.
 * Please note: this method is meant to be called after the database is ready.
 * @param {string} tableA the name of the table A.
 * @param {string} tableB the name of the table B.
 * @returns {(Array.<string>|null)}
 */
Database.prototype.findPath = function (tableA, tableB, path, solutions) {
  // check if database is ready
  if (!this.isReady) return null;

  // handle optional "path" param
  path = path || [tableA];

  // handle optional "solutions" param
  solutions = solutions || [];

  // this is Sparta...
  if (_.last(path) !== tableB) { // are we there yet?
    _.forOwn(this._meta[tableA].refTables, function (columns, table) {
      var arr = path.slice(0);

      if (arr.indexOf(table) === -1) { // avoid running in circles
        arr.push(table);
        this.findPath(table, tableB, arr, solutions);
      }
    }, this);

  } else { // destination reached
    solutions.push(path);
  }

  // check if solutions is empty
  if (solutions.length === 0) return null;

  // return shortest path
  return _.min(solutions, function(solution) {
    return solution.length;
  });
};

module.exports = Database;
