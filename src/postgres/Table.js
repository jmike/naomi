var Promise = require('bluebird'),
  _ = require('lodash'),
  Table = require('../Table'),
  querybuilder = require('./querybuilder'),
  Transaction = require('./transaction');

/**
 * Constructs a new Postgres Table.
 * @extends {Table}
 * @constructor
 */
function PostgresTable () {
  Table.apply(this, arguments);
}

// PostgresTable extends Table
PostgresTable.prototype = Object.create(Table.prototype);

PostgresTable.prototype._get = function (options) {
  var query;

  options.table = this._table;
  options.columns = Object.keys(this._columns);
  query = querybuilder.select(options);

  return this._db.query(query.sql, query.params);
};

PostgresTable.prototype._count = function (options) {
  var self = this, resolver, query;

  options.table = this._table;
  query = querybuilder.count(options);

  resolver = function (resolve, reject) {
    self._db.query(query.sql, query.params).then(function (records) {
      resolve(records[0].count | 0);
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

PostgresTable.prototype._del = function (options) {
  var self = this, resolver, query;

  options.table = this._table;
  query = querybuilder.delete(options);

  resolver = function (resolve, reject) {
    self._db.query(query.sql, query.params).then(function () {
      resolve();
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

PostgresTable.prototype._set = function (options) {
  var self = this, resolver, query;

  if (_.isArray(options.values)) {
    return Promise.map(options.values, function (obj) {
      options.values = obj;
      return self.set(options);
    }).all();
  }

  options.table = this._table;
  query = querybuilder.upsert(options);

  resolver = function (resolve, reject) {
    var t = new Transaction(self._db);
    t.begin().then(function () {
      return t.query('LOCK TABLE "' + self._table + '" IN SHARE ROW EXCLUSIVE MODE;');
    }).then(function () {
      return t.query(query.sql, query.params);
    }).then(function (records) {
      return t.commit().then(function () {
        resolve(records);
      });
    }).catch(function (err) {
      reject(err);
    });
  };

  return new Promise(resolver);
};

PostgresTable.prototype._setNew = function (options) {
  return Promise.resolve(options);
};

module.exports = PostgresTable;
