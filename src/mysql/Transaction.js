var Promise = require('bluebird'),
  _ = require('lodash');

var Transaction = _.extend(require('../Transaction'));

Transaction.prototype._query = function (sql, params, options) {
  var self = this, resolver;

  if (options.nestTables) {
    sql = {
      sql: sql,
      nestTables: options.nestTables
    };
  }

  resolver = function (resolve, reject) {
    self._client.query(sql, params, function(err, result) {
      if (err) return reject(err);
      resolve(result.rows);
    });
  };

  return new Promise(resolver);
};

Transaction.prototype.begin = function () {
  return this._engine._acquireClient()
    .bind(this)
    .then(function (client) {
      this._client = client;
      return this.query('START TRANSACTION;');
    })
    .then(function () {
      return this;
    });
};

Transaction.prototype.commit = function () {
  return this.query('COMMIT;')
    .bind(this)
    .then (function () {
      this._engine._releaseClient(this._client);
      this._client = null;
      return this;
    });
};

module.exports = Transaction;
