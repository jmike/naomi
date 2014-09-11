var Promise = require('bluebird'),
  _ = require('lodash'),
  GenericTransaction = require('../Transaction');

/**
 * Constructs a new MySQL transaction.
 * @extends {GenericTransaction}
 * @constructor
 */
function Transaction () {
  GenericTransaction.apply(this, arguments);
}

// MySQL Transaction extends GenericTransaction
Transaction.prototype = Object.create(GenericTransaction.prototype);

/**
 * Runs the given parameterized SQL query as part of this transaction.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} options query options.
 * @returns {Promise}
 * @private
 */
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

/**
 * Begins this transaction.
 * @param {function} [callback] an optional callback function.
 * @return {Promise} resolving to this transaction instance.
 */
Transaction.prototype.begin = function (callback) {
  return this._db.acquireClient()
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
      this._db.releaseClient(this._client);
      this._client = null;
      return this;
    })
    .nodeify(callback);
};

module.exports = Transaction;
