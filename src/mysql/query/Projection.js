var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');

function Projection($projection) {
  var $include = [];
  var $exclude = [];

  if (_.isUndefined($projection)) {
    this.$include = [];
    this.$exclude = [];

  } else if (_.isPlainObject($projection)) {
    // separate exclusive from inclusive columns
    _.forOwn($projection, function (v, k) {
      if (v === 1) {
        $include.push(k);
      } else if (v === 0 || v === -1) {
        $exclude.push(k);
      } else {
        throw new Error('Invalid property "' + k + '"; value must be either -1 or 1');
      }
    });

    this.$include = $include;
    this.$exclude = $exclude;

  } else { // everything else is unacceptable
    throw new Error('Invalid $projection argument; expected object, received ' + type($projection));
  }
}

Projection.prototype.toParamSQL = function (table) {
  var sql, columns;

  // extract columns from table
  columns = table.columns.map(function (e) {
    return e.name;
  });

  // check if $include is not empty
  if (!_.isEmpty(this.$include)) {
    sql = this.$include
      .map(function (e) {
        // make sure column exists in table
        if (!table.hasColumn(e))  {
          throw new Error('Unknown column "' + e + '"; not found in table "' + table.name + '"');
        }
        return escape(e);
      })
      .join(', ');

    return {sql: sql, params: []};
  }

  // check if $exclude is not empty
  if (!_.isEmpty(this.$exclude)) {
    sql = _.chain(this.$exclude)
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

    return {sql: sql, params: []};
  }

  // both $include and $exclude are empty
  sql = columns
    .map(function (e) {
      return escape(e);
    })
    .join(', ');

  return {sql: sql, params: []};
};

Projection.fromObject = function (query) {
  if (!_.isPlainObject(query)) return new Projection();
  return new Projection(query.$projection);
};

module.exports = Projection;
