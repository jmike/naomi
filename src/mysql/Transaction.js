var Promise = require('bluebird');

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
 * Rolls back the transaction.
 * Please note: transaction will become effectively useless after calling this method.
 * @param {Function} [callback] an optional callback function. with (err, transaction) arguments
 * @return {Promise} resolving to this transaction
 */
Transaction.prototype.rollback = function (callback) {
  var _this = this;

  if (this.client === null) {
    return Promise.reject(new Error('Invalid transaction state; transaction not yet started'));
  }

  return this.query('ROLLBACK;')
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
  if (this.client === null) {
    return Promise.reject(new Error('Invalid transaction state; transaction not yet started'));
  }

  return this.db.queryClient(this.client, sql, params, options)
    .bind(this)
    .nodeify(callback);
};

module.exports = Transaction;
