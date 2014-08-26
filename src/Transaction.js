var Promise = require('bluebird'),
  _ = require('lodash');

function Transaction (engine) {
  this._engine = engine;
  this._client = null;
}

/**
 * Runs the given SQL statement without checking the transaction state.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} [options] query options - currently unused.
 * @returns {Promise}
 * @private
 */
Transaction.prototype._rawQuery = function (sql, params) {
  var self = this, resolver;

  resolver = function (resolve, reject) {
    self._client.query(sql, params, function(err, result) {
      if (err) return reject(err);
      resolve(result.rows);
    });
  };

  return new Promise(resolver);
};

/**
 * Runs the given SQL statement as part of this transaction.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} [options] query options - currently unused.
 * @param {function} [callback] an optional callback function.
 * @returns {Promise} resolving to the query results.
 * @private
 */
Transaction.prototype.query = function (sql, params, options, callback) {
  // handle optional "options" param
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  if (this._client === null) {
    return Promise.reject('Invalid transaction state - did you forget to call #begin()?');
  }

  sql = this._engine._prepareSQL(sql); // convert "?" to "$n" in sql

  return this._rawQuery(sql, params).nodeify(callback);
};

/**
 * Initiates this transaction.
 * @return {Promise} resolving to this transaction instance.
 */
Transaction.prototype.begin = function () {
  this._engine._acquireClient()
    .bind(this)
    .then(function (client) {
      this._client = client;
      return this._query('START TRANSACTION;', []);
    })
    .then(function () {
      return this;
    });
};

Transaction.prototype.savepoint = function () {

};

Transaction.prototype.release = function () {

};

Transaction.prototype.rollback = function () {

};

/**
 * Commits this transaction to database.
 * After calling this method the transaction becomes effectively useless.
 * @return {Promise} resolving to this transaction instance.
 */
Transaction.prototype.commit = function () {
  this.query('COMMIT;', [])
    .bind(this)
    .then (function () {
      this._engine._releaseClient(this._client);
      this._client = null;
      return this;
    });
};

Transaction.prototype.abort = function () {

};

module.exports = Transaction;
