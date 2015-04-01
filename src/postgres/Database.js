var util = require('util');
var EventEmitter = require('events').EventEmitter;
var pg = require('pg.js');
var Promise = require('bluebird');
var type = require('type-of');
var _ = require('lodash');
var createPool = require('generic-pool').Pool;
var Table = require('./Table');
var Transaction = require('./Transaction');

/**
 * Creates new Postgres Database.
 * @param {object} props connection properties.
 * @param {string} props.database the name of the database
 * @param {string} [props.host=localhost] optional hostname; defaults to "localhost"
 * @param {number} [props.port=5432] optional port number; defaults to 5432
 * @param {string} [props.user=root] optional user name to access the database; defaults to "root"
 * @param {string} [props.password] optional password to access the database; defaults to "" (empty string)
 * @param {number} [props.connectionLimit=10] optional maximum number of connections to maintain in the pool
 * @throws {Error} if props is unspecified or invalid.
 * @constructor
 */
function Database(props) {
  // validate props argument
  if (!_.isPlainObject(props)) {
    throw new Error('Invalid props argument; expected object, received ' + type(props));
  }

  // handle optional props
  props = _.defaults(props, {
    host: 'localhost',
    port: 5432,
    user: 'root',
    password: '',
    connectionLimit: 10,
    poolIdleTimeout: 30000,
    reapIntervalMillis: 1000
  });

  // set class properties
  this.connectionProperties = props;
  this.name = props.database;
  this.isConnected = false;
  this._pool = null;

  // init the EventEmitter
  EventEmitter.call(this);
  this.setMaxListeners(999);
}

// @extends EventEmitter
util.inherits(Database, EventEmitter);

/**
 * Enqueues the given resolver function until the database client is connected.
 * Executes the resolver immediately after connection.
 * @param {Function} resolver
 * @return {Promise}
 * @private
 */
Database.prototype._enqueue = function (resolver) {
  var _this = this;

  return new Promise(function(resolve, reject) {
    if (_this.isConnected) {
      resolver(resolve, reject);
    } else {
      // wait for db connection
      _this.once('connect', function () {
        resolver(resolve, reject);
      });
    }
  });
};

/**
 * Connects to server using the connection properties supplied at construction time.
 * @param {Function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 * @emits Database#connect
 */
Database.prototype.connect = function (callback) {
  var _this = this;
  var props;

  // check if already connected
  if (this.isConnected) {
    return Promise.resolve()
      .nodeify(callback);
  }

  // set pool properties
  props = {
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
  };

  // connect
  return Promise.try(function () {
    _this._pool = createPool(props);
  })
    .then(function () {
      _this.isConnected = true;
      _this.emit('connect');
    })
    .nodeify(callback);
};

/**
 * Gracefully closes open connection(s) to the server.
 * Please note: the database client will become practically useless after calling this method.
 * @param {Function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 * @emits Database#disconnect
 */
Database.prototype.disconnect = function (callback) {
  var _this = this;

  // check if already disconnected
  if (!this.isConnected) {
    return Promise.resolve()
      .nodeify(callback);
  }

  // disconnect
  return Promise.try(function () {
    _this._pool.drain(function () {
      _this._pool.destroyAllNow();
    });
  })
    .then(function () {
      _this.isConnected = false;
      _this.isReady = false;
      _this.emit('disconnect');
    })
    .nodeify(callback);
};

/**
 * Acquires the first available client from the internal connection pool.
 * @param {Function} [callback] an optional callback function with (err, client) arguments.
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
 * Releases the designated client and restores it in the internal connection pool.
 * @param {Client} client
 */
Database.prototype.releaseClient = function (client) {
  this._pool.release(client);
};

/**
 * Converts "?" chars to "$1", "$2", etc, according to the order they appear in the given SQL statement.
 * This method provides a compatibility layer with MySQL, exposing a uniform syntax for params.
 * @param {string} sql a parameterized SQL statement, using "?" to denote param.
 * @return {string}
 * @static
 */
Database.prepareSQL = function (sql) {
  var re = /\?/g;
  var i = 0;

  return sql.replace(re, function () {
    i++;
    return '$' + i;
  });
};

/**
 * Runs the given parameterized SQL statement to the supplied db client.
 * Please note: This is a low-level function of the #query method.
 * @param {Client} client a db client.
 * @param {(String|Object)} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {Function} [callback] a callback function with (err, records) arguments.
 * @return {Promise} resolving to the query results.
 */
Database.prototype.queryClient = function (client, sql, params, options, callback) {
  var resolver;

  // validate sql argument
  if (!_.isString(sql)) {
    return Promise.reject(new Error('Invalid sql argument; expected string, received ' + type(sql)))
      .nodeify(callback);
  }

  // handle optional params argument
  if (_.isFunction(params)) {
    callback = params;
    options = undefined;
    params = [];
  } else if (_.isPlainObject(params)) {
    callback = options;
    options = params;
    params = [];
  } else if (_.isUndefined(params)) {
    callback = undefined;
    options = undefined;
    params = [];
  }

  // validate params argument
  if (!_.isArray(params)) {
    return Promise.reject(new Error('Invalid params argument; expected array, received ' + type(params)))
      .nodeify(callback);
  }

  // handle optional options argument
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  } else if (_.isUndefined(options)) {
    callback = undefined;
    options = {};
  }

  // validate options argument
  if (!_.isPlainObject(options)) {
    return Promise.reject(new Error('Invalid options argument; expected object, received ' + type(options)))
      .nodeify(callback);
  }

  // replace "?" with "$#"
  sql = Database.prepareSQL(sql);

  resolver = function (resolve, reject) {
    client.query(sql, params, function(err, result) {
      var records;

      if (err) return reject(err);

      records = result.rows.map(function (row) {
         return _.create(Object.prototype, row);
      });

      result.rows.length = 0; // memory optimization

      resolve(records);
    });
  };

  return new Promise(resolver).nodeify(callback);
};

/**
 * Runs the given parameterized SQL statement.
 * @param {string} sql the SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {object} [options] query options.
 * @param {Function} [callback] a callback function with (err, records) arguments.
 * @returns {Promise} resolving to the query results.
 */
Database.prototype.query = function (sql, params, options, callback) {
  var _this = this;
  var resolver;

  // define promise resolver
  resolver = function (resolve, reject) {
    // acquire client
    _this.acquireClient()
      // query query
      .then(function (client) {
        return _this.queryClient(client, sql, params, options)
          // always release previously acquired client
          .finally(function () {
            return _this.releaseClient(client);
          });
      })
      .then(resolve, reject);
  };

  return this._enqueue(resolver).nodeify(callback);
};

/**
 * Indicates whether the designated table exists in database.
 * @param {string} table the name of the table.
 * @param {Function} [callback] a callback function with (err, bool) arguments.
 * @returns {Promise}
 */
Database.prototype.hasTable = function (table, callback) {
  var sql;
  var params;

  // validate table argument
  if (!_.isString(table)) {
    return Promise.reject(new Error('Invalid table argument; expected string, received ' + type(table)))
      .nodeify(callback);
  }

  sql = [
    'SELECT table_name',
    'FROM information_schema.tables',
    'WHERE table_catalog = $1',
    'AND table_schema NOT IN (\'pg_catalog\', \'information_schema\')',
    'AND table_name = $2',
    'AND table_type = \'BASE TABLE\'',
    'LIMIT 1;'
  ].join(' ');
  params = [this.name, table];

  return this.query(sql, params)
    .then(function (records) {
      return records.length === 1;
    })
    .nodeify(callback);
};

/**
 * Retrieves table names from the database.
 * @param {Function} [callback] a callback function with (err, tableNames) arguments.
 * @returns {Promise}
 */
Database.prototype.getTables = function (callback) {
  var sql = [
    'SELECT table_name',
    'FROM information_schema.tables',
    'WHERE table_type = \'BASE TABLE\'',
    'AND table_catalog = $1',
    'AND table_schema NOT IN (\'pg_catalog\', \'information_schema\');'
  ].join(' ');

  var params = [this.name];

  return this.query(sql, params)
    .map(function (record) {
      return record.table_name;
    })
    .nodeify(callback);
};

/**
 * Returns a new Table, augmented with the given properties and methods.
 * Please note: this method will not create a new table on database - it will merely reference an existing one.
 * @param {string} tableName the name of the table in database.
 * @param {object} [customProperties] the table's custom properties and methods.
 * @returns {Table}
 */
Database.prototype.extend = function (tableName, customProperties) {
  var table;

  // validate tableName argument
  if (!_.isString(tableName)) {
    throw new Error('Invalid tableName argument: expected string, received ' + type(tableName));
  }

  // create table
  table = new Table(this, tableName);

  // extend with custom properties
  if (_.isPlainObject(customProperties)) {
    table = _.extend(table, customProperties);
  }

  // load table metadata
  if (this.isConnected) {
    table.loadMeta();
  } else {
    // wait for db connection
    this.once('connect', table.loadMeta.bind(table));
  }

  return table;
};

/**
 * Begins a new transaction with this database.
 * @param {Function} [callback] an optional callback function with (err, transaction) arguments
 * @returns {Promise} resolving to a new Transaction instance
 */
Database.prototype.beginTransaction = function (callback) {
  return new Transaction(this)
    .begin()
    .nodeify(callback);
};

module.exports = Database;
