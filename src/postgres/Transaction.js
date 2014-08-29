var Promise = require('bluebird'),
  Transaction = require('../PostgresTransaction');

/**
 * Constructs a new Postgres transaction.
 * @extends {Transaction}
 * @constructor
 */
function PostgresTransaction () {
  Transaction.apply(this, arguments);
}

// PostgresTransaction extends Transaction
PostgresTransaction.prototype = Object.create(Transaction.prototype);

PostgresTransaction.prototype._query = function (sql, params) {
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

PostgresTransaction.prototype.begin = function (callback) {
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

PostgresTransaction.prototype.commit = function (callback) {
  return this.query('COMMIT;')
    .bind(this)
    .then (function () {
      this.releaseClient(this._client);
      this._client = null;
      return this;
    })
    .nodeify(callback);
};

module.exports = PostgresTransaction;
