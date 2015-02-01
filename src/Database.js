var events = require('events');
var util = require('util');
var _ = require('lodash');
var type = require('type-of');
var Promise = require('bluebird');
var Table = require('./Table');

/**
 * Creates new Database client of the designated properties.
 * Please note: connection properties may vary depending on the database type.
 * @param {object} props connection properties.
 * @param {string} [props.host=localhost] the hostname of the database.
 * @param {(string|number)} [props.port] the port number of the database.
 * @param {string} [props.user=root] the user to access the database.
 * @param {string} props.password the password of the user.
 * @param {string} props.database the name of the database.
 * @param {number} [props.connectionLimit=10] number maximum number of connections to maintain in the pool.
 * @constructor
 */
function Database(props) {
  this.connectionProperties = props;
  this.name = props.database;
  this.isConnected = false;

  // init the EventEmitter
  events.EventEmitter.call(this);
  this.setMaxListeners(999);
}

// @extends EventEmitter
util.inherits(Database, events.EventEmitter);

/**
 * Enqueues the given resolver function until the database client is connected.
 * Executes the resolver immediately after connection.
 * @param {function} resolver
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
 * @param {function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 * @emits Database#connect
 */
Database.prototype.connect = function (callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve) {
    _this.isConnected = true;
    _this.emit('connect');
    resolve();
  };

  return new Promise(resolver).nodeify(callback);
};

/**
 * Gracefully closes open connection(s) to the server.
 * Please note: the database client will become practically useless after calling this method.
 * @param {function} [callback] an optional callback function with (err) arguments.
 * @returns {Promise}
 * @emits Database#disconnect
 */
Database.prototype.disconnect = function (callback) {
  var _this = this;
  var resolver;

  resolver = function (resolve) {
    _this.isConnected = false;
    _this.isReady = false;
    _this.emit('disconnect');
    resolve();
  };

  return new Promise(resolver).nodeify(callback);
};

/**
 * Runs the given parameterized SQL statement.
 * @param {string} sql the SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {object} [options] query options.
 * @param {function} [callback] a callback function with (err, records) arguments.
 * @returns {Promise} resolving to the query results.
 */
Database.prototype.query = function (sql, params, options, callback) {
  return Promise.resolve().nodeify(callback);
};

/**
 * Indicates whether the designated table exists in database.
 * @param {string} table the name of the table.
 * @param {function} [callback] a callback function with (err, bool) arguments.
 * @returns {Promise}
 */
Database.prototype.hasTable = function (table, callback) {
  return Promise.resolve().nodeify(callback);
};

// associate with Table class
Database.prototype.Table = Table;

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
  table = new this.Table(this, tableName);

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

// // associate with Transaction class
// Database.prototype.Transaction = Transaction;

// /**
//  * Begins a new transaction with this database.
//  * @param {function} [callback] a callback function.
//  * @returns {Promise} resolving to a new Transaction instance.
//  */
// Database.prototype.beginTransaction = function (callback) {
//   var t = new this.Transaction(this);

//   return t.begin().then(function () {
//     return t;
//   }).nodeify(callback);
// };

// /**
//  * Returns the shortest path from table A to table B.
//  * Please note: this method is meant to be called after the database is ready.
//  * @param {string} tableA the name of the table A.
//  * @param {string} tableB the name of the table B.
//  * @returns {(Array.<string>|null)}
//  */
// Database.prototype.findPath = function (tableA, tableB, path, solutions) {
//   // check if database is ready
//   if (!this.isReady) return null;

//   // handle optional "path" param
//   path = path || [tableA];

//   // handle optional "solutions" param
//   solutions = solutions || [];

//   // this is Sparta...
//   if (_.last(path) !== tableB) { // are we there yet?
//     _.forOwn(this._meta[tableA].refTables, function (columns, table) {
//       var arr = path.slice(0);

//       if (arr.indexOf(table) === -1) { // avoid running in circles
//         arr.push(table);
//         this.findPath(table, tableB, arr, solutions);
//       }
//     }, this);

//   } else { // destination reached
//     solutions.push(path);
//   }

//   // check if solutions is empty
//   if (solutions.length === 0) return null;

//   // return shortest path
//   return _.min(solutions, function(solution) {
//     return solution.length;
//   });
// };

module.exports = Database;
