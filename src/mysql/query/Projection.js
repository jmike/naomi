var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');

module.exports = function ($projection, table) {
  var include = [];
  var exclude = [];
  var sql;

  // handle optional $projection argument
  if (_.isUndefined($projection)) $projection = {};

  // make sure projection is valid
  if (!_.isPlainObject($projection)) {
    throw new Error('Invalid $projection argument; expected object, received ' + type($projection));
  }

  // extract columns from table
  var columns = table.columns.map(function (e) {
    return e.name;
  });

  // populate include + exclude arrays
  _.forOwn($projection, function (v, k) {
    if (v === 1) {
      include.push(k);
    } else if (v === 0 || v === -1) {
      exclude.push(k);
    } else {
      throw new Error('Invalid property "' + k + '"; value must be either -1 or 1');
    }
  });

  // check if include/exclude has elements
  if (include.length !== 0) {
    sql = include
      .map(function (e) {
        // make sure column exists in table
        if (!table.hasColumn(e))  {
          throw new Error('Unknown column "' + e + '"; not found in table "' + table.name + '"');
        }
        return escape(e);
      })
      .join(', ');

  } else if (exclude.length !== 0) {
    sql = _.chain(exclude)
      .xor(columns)
      .map(function (e) {
        // make sure column exists in table
        if (!table.hasColumn(e))  {
          throw new Error('Unknown column "' + e + '"; not found in table "' + table.name + '"');
        }
        return escape(e);
      })
      .join(', ')
      .value();

  } else {
    sql = columns
      .map(function (e) {
        return escape(e);
      })
      .join(', ');
  }

  return {sql: sql, params: []};
};
