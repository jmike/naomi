var Promise = require('bluebird'),
  GenericTransaction = require('../Transaction');

/**
 * Constructs a new Postgres transaction.
 * @extends {GenericTransaction}
 * @constructor
 */
function Transaction () {
  GenericTransaction.apply(this, arguments);
}

// Transaction extends GenericTransaction
Transaction.prototype = Object.create(GenericTransaction.prototype);

/**
 * Runs the given parameterized SQL query as part of this transaction.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} options query options.
 * @returns {Promise}
 * @private
 */
Transaction.prototype._query = function (sql, params) {
  var self = this, resolver;

  sql = self.prepareSQL(sql);

  resolver = function (resolve, reject) {
    self._client.query(sql, params, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result.rows);
      }
    });
  };

  return new Promise(resolver).bind(this);
};

/**
 * Begins this transaction.
 * @param {function} [callback] an optional callback function.
 * @return {Promise} resolving to this transaction instance.
 */
Transaction.prototype.begin = function (callback) {
  return this.acquireClient()
    .bind(this)
    .then(function (client) {
      this._client = client;
      return this.query('BEGIN;');
    })
    .then(function () {
      return this;
    })
    .nodeify(callback);
};

/**
 * Commits this transaction.
 * Please note: transaction will become effectively useless after calling this method.
 * @param {function} [callback] an optional callback function.
 * @return {Promise} resolving to this transaction instance.
 */
Transaction.prototype.commit = function (callback) {
  return this.query('COMMIT;')
    .bind(this)
    .then (function () {
      this.releaseClient(this._client);
      this._client = null;
      return this;
    })
    .nodeify(callback);
};

module.exports = Transaction;
