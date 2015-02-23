var Promise = require('bluebird');
var _ = require('lodash');
var type = require('type-of');

/**
 * Creates a new Transaction with the designated database.
 * @param {Database} db
 * @constructor
 */
function Transaction (db) {
  this.db = db;
  this.client = null;
}

/**
 * Initiates the transaction.
 * @param {Function} [callback] an optional callback function with (err, transaction) arguments
 * @return {Promise} resolving to this transaction
 */
Transaction.prototype.begin = function (callback) {
  var _this = this;

  if (this.client !== null) {
    return Promise.reject(new Error('Invalid transaction state; transaction already in progress'));
  }

  return this.db.acquireClient()
    .then(function (client) {
      _this.client = client;
      return _this.query('START TRANSACTION;');
    })
    .return(_this)
    .bind(this)
    .nodeify(callback);
};

/**
 * Commits the transaction.
 * Please note: transaction will become effectively useless after calling this method.
 * @param {Function} [callback] an optional callback function. with (err, transaction) arguments
 * @return {Promise} resolving to this transaction
 */
Transaction.prototype.commit = function (callback) {
  var _this = this;

  if (this.client === null) {
    return Promise.reject(new Error('Invalid transaction state; transaction not yet started'));
  }

  return this.query('COMMIT;')
    .then (function () {
      _this.db.releaseClient(_this.client);
      _this.client = null;
    })
    .return(_this)
    .bind(this)
    .nodeify(callback);
};

/**
 * Runs the given parameterized SQL statement as part of the transaction.
 * @param {String} sql parameterized SQL statement
 * @param {Array} [params] an array of parameter values
 * @param {Object} [options] query options
 * @param {Function} [callback] a callback function with (err, records) arguments
 * @returns {Promise} resolving to the query results
 */
Transaction.prototype.query = function (sql, params, options, callback) {
  var _this = this;
  var resolver;

  // validate sql argument
  if (!_.isString(sql)) {
    throw new Error('Invalid sql argument; expected string, received ' + type(sql));
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
    throw new Error('Invalid params argument; expected array, received ' + type(params));
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
    throw new Error('Invalid options argument; expected object, received ' + type(options));
  }

  // make sure transaction has started
  if (this.client === null) {
    return Promise.reject(new Error('Invalid transaction state; transaction not yet started'));
  }

  // check if options is specified
  if (!_.isEmpty(options)) {
    sql = _.assign(options, {sql: sql}); // merge with sql
  }

  // define promise resolver
  resolver = function (resolve, reject) {
    _this.client.query(sql, params, function (err, records) {
      if (err) return reject(err);

      // check if sql is SELECT statement
      if (_.isArray(records)) {
        resolve(records);
      } else {
        // sql is DML statement
        resolve({
          insertId: records.insertId,
          affectedRows: records.affectedRows
        });
      }
    });
  };

  return new Promise(resolver)
    .bind(this)
    .nodeify(callback);
};

module.exports = Transaction;
