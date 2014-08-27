var Promise = require('bluebird'),
  _ = require('lodash'),
  AbstractTransaction = require('../Transaction');

/**
 * Constructs a new MySQL transaction.
 * @extends {AbstractTransaction}
 */
function Transaction () {
  AbstractTransaction.apply(this, arguments);
}

Transaction.prototype = Object.create(AbstractTransaction.prototype);

Transaction.prototype._query = function (sql, params, options) {
  var self = this, resolver;

  if (options.nestTables) {
    sql = {
      sql: sql,
      nestTables: options.nestTables
    };
  }

  resolver = function (resolve, reject) {
    self._client.query(sql, params, function(err, records) {
      var data;

      if (err) return reject(err);

      if (_.isArray(records)) { // SELECT statement
        resolve(records);

      } else { // DML statement
        data = {
          insertId: records.insertId,
          affectedRows: records.affectedRows
        };

        resolve(data);
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
      return this.query('START TRANSACTION;');
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
