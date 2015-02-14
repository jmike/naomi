var _ = require('lodash');
var type = require('type-of');

var Expression;
var And = require('./Expression.And')(Expression);
var Or = require('./Expression.Or')(Expression);
var Equal = require('./Expression.Equal')(Expression);
var NotEqual = require('./Expression.NotEqual')(Expression);
var LessThan = require('./Expression.LessThan')(Expression);
var LessThanOrEqual = require('./Expression.LessThanOrEqual')(Expression);
var GreaterThan = require('./Expression.GreaterThan')(Expression);
var GreaterThanOrEqual = require('./Expression.GreaterThanOrEqual')(Expression);
var In = require('./Expression.In')(Expression);
var NotIn = require('./Expression.NotIn')(Expression);
var Like = require('./Expression.Like')(Expression);
var NotLike = require('./Expression.NotLike')(Expression);
var Id = require('./Expression.Id')(Expression);
var escape = require('./escape');

var λ = {
  $and: function (e) { return new And(e); },
  $or: function (e) { return new Or(e); },
  $eq: function (e) { return new Equal(e); },
  $ne: function (e) { return new NotEqual(e); },
  $lt: function (e) { return new LessThan(e); },
  $lte: function (e) { return new LessThanOrEqual(e); },
  $gt: function (e) { return new GreaterThan(e); },
  $gte: function (e) { return new GreaterThanOrEqual(e); },
  $in: function (e) { return new In(e); },
  $nin: function (e) { return new NotIn(e); },
  $like: function (e) { return new Like(e); },
  $nlike: function (e) { return new NotLike(e); },
  $id: function (e) { return new Id(e); }
};

Expression = function ($expression) {
  var tp = type($expression);
  var keys;

  if (Buffer.isBuffer($expression)) tp = 'buffer';

  switch (tp) {
    case 'undefined':
      this._v = null;
      break;

    case 'array':
      this._v = {$or: $expression};
      break;

    case 'number':
    case 'string':
    case 'boolean':
    case 'date':
    case 'buffer':
      this._v = {$id: $expression};
      break;

    case 'object':
      keys = Object.keys($expression);

      if (keys.length === 0) {
        this._v = null;

      } else if (keys.length > 1) {
        this._v = {$and: keys.map(function (k) {
          return _.pick($expression, k);
        })};

      } else {
        this._v = $expression;
      }

      break;

    default:
      throw new Error('Invalid $expression argument; expected plain value or array or object, received ' + type($expression));
  }
};

Expression.prototype.toParamSQL = function (table) {
  var sql = [];
  var params = [];
  var key, value, expression, query;

  // check if $expression is null
  if (_.isNull(this._v)) return null;

  // extract key + value
  key = Object.keys(this._v)[0];
  value = this._v[key];

  if (λ[key]) {
    expression = λ[key](value);

  } else {
    // make sure key is a valid column
    if (!table.hasColumn(key)) {
      throw new Error('Unknown column "' + key + '"; not found in table "' + table.name + '"');
    }

    sql.push(escape(key));

    if (_.isPlainObject(value)) {
      expression = new Expression(value);

    } else {
      expression = new λ.$eq(value);
    }
  }

  query = expression.toParamSQL(table);
  sql.push(query.sql);
  params = params.concat(query.params);

  return {sql: sql.join(' '), params: params};
};

Expression.fromObject = function ($query) {
  return new Expression($query);
};

module.exports = Expression;
