var _ = require('lodash');

/**
 * Constructs a new MySQL model, i.e. an object representing a single MySQL record.
 * @param {Database} collection a MySQL collection instance.
 * @param {Object} data the record's data.
 * @constructor
 */
function Model(collection, data) {
  this._collection = collection;
  this._db = collection.db;
  this._table = collection.table;
  this._columns = Object.keys(collection.columns);
  this._primaryKey = collection.primaryKey;

  _.extend(this, data);
}

/**
 * Returns a custom-tailored selector to match this model in database.
 * @private
 */
Model.prototype._getSelector = function () {
  var self = this,
    selector = {};

  this._primaryKey.forEach(function (k) {
    selector[k] = self[k];
  });

  return selector;
};

/**
 * Returns the attributes of this model.
 * @private
 */
Model.prototype._getAttributes = function () {
  var self = this,
    attrs = {};

  this._columns.forEach(function (k) {
    attrs[k] = self[k];
  });

  return attrs;
};

/**
 * Updates this model in database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Model.prototype.save = function (callback) {
  var sql, params, whereClause;

  sql = 'UPDATE ?? SET ?';
  params = [this._table, this._getAttributes()];

  whereClause = this._collection._parseSelector(this._getSelector());
  sql += ' WHERE ' + whereClause.sql;
  params.push.apply(params, whereClause.params);

  sql += ' LIMIT 1;';

  this._db.query(sql, params, callback);
};

/**
 * Deletes this model from database.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Model.prototype.del = function (callback) {
  var sql, params, whereClause;

  sql = 'DELETE FROM ??';
  params = [this._table];

  whereClause = this._collection._parseSelector(this._getSelector());
  sql += ' WHERE ' + whereClause.sql;
  params.push.apply(params, whereClause.params);

  sql += ' LIMIT 1;';

  this._db.query(sql, params, callback);
};

/**
 * Retrieves the record(s) from the given related table from database.
 * @param {String} table the name of the related table.
 * @param {Function} callback a callback function i.e. function(error, data).
 */
Model.prototype.getRelated = function (table, callback) {
  return this._collection.getRelated(table, this._getSelector(), callback);
};

module.exports = Model;