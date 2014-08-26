var Promise = require('bluebird'),
  _ = require('lodash');

/**
 * Constructs a new Transaction with the given Database.
 * @param {Database} db
 * @constructor
 */
function Transaction (db) {
  this._engine = db._engine;
  this._client = null;
}

/**
 * Runs the given parameterized SQL query as part of this transaction.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} params an array of parameter values.
 * @param {object} options query options.
 * @returns {Promise}
 * @private
 */
Transaction.prototype._query = function (sql, params, options) {
  return Promise.resolve();
};

/**
 * Runs the given SQL statement as part of this transaction.
 * @param {string} sql a parameterized SQL statement.
 * @param {Array} [params] an array of parameter values.
 * @param {object} [options] query options.
 * @param {function} [callback] a callback function, i.e. function(err, records).
 * @returns {Promise} resolving to the query results.
 */
Transaction.prototype.query = function (sql, params, options, callback) {
  // validate "sql" param
  if (!_.isString(sql)) {
    return Promise.reject('Invalid SQL statement: expected string, received ' + typeof(sql))
      .nodeify(callback);
  }

  // handle optional "params" param
  if (!_.isArray(params)) {

    if (_.isPlainObject(params)) {
      options = params;
    } else if (_.isFunction(params)) {
      options = undefined;
      callback = params;
    } else if (!_.isUndefined(params)) {
      return Promise.reject('Invalid query parameters: expected Array, received ' + typeof(params))
        .nodeify(callback);
    }

    params = [];
  }

  // handle optional "options" param
  if (!_.isPlainObject(options)) {

    if (_.isFunction(options)) {
      callback = options;
    } else if (!_.isUndefined(options)) {
      return Promise.reject('Invalid query options: expected plain object, received ' + typeof(options))
        .nodeify(callback);
    }

    options = {};
  }

  // make sure client has been acquired
  if (this._client === null) {
    return Promise.reject('Invalid transaction state - did you forget to call #begin()?')
      .nodeify(callback);
  }

  // run the query
  return this._query(sql, params, options).nodeify(callback);
};

/**
 * Begins this transaction.
 * @return {Promise} resolving to this transaction instance.
 */
Transaction.prototype.begin = function () {
  return Promise.resolve(this);
};

/**
 * Commits this transaction.
 * Please note: transaction will become effectively useless after calling this method.
 * @return {Promise} resolving to this transaction instance.
 */
Transaction.prototype.commit = function () {
  return Promise.resolve(this);
};

module.exports = Transaction;
