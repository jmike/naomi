var Promise = require('bluebird'),
  AbstractTransaction = require('../Transaction');

/**
 * Constructs a new Postgres transaction.
 * @extends {AbstractTransaction}
 * @constructor
 */
function Transaction () {
  AbstractTransaction.apply(this, arguments);
}

// Transaction extends AbstractTransaction
Transaction.prototype = Object.create(AbstractTransaction.prototype);

Transaction.prototype._query = function (sql, params) {
  var self = this, resolver;

  sql = self._engine.prepareSQL(sql);

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

Transaction.prototype.begin = function (callback) {
  return this._engine.acquireClient()
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

Transaction.prototype.commit = function (callback) {
  return this.query('COMMIT;')
    .bind(this)
    .then (function () {
      this._engine.releaseClient(this._client);
      this._client = null;
      return this;
    })
    .nodeify(callback);
};

module.exports = Transaction;
