var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');
var Equal = require('./Equal');
var NotEqual = require('./NotEqual');
var LessThan = require('./LessThan');
var LessThanOrEqual = require('./LessThanOrEqual');
var GreaterThan = require('./GreaterThan');
var GreaterThanOrEqual = require('./GreaterThanOrEqual');
var In = require('./In');
var NotIn = require('./NotIn');
var Like = require('./Like');
var NotLike = require('./NotLike');

var λ = {
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
};

function Expression($expression) {
  var keys;

  if (_.isUndefined($expression)) {
    this._v = null;

  } else if (_.isArray($expression)) {
    this._v = {$or: $expression};

  } else if (
    _.isNumber($expression) ||
    _.isString($expression) ||
    _.isBoolean($expression) ||
    _.isDate($expression) ||
    Buffer.isBuffer($expression)
  ) {
    this._v = {$primarykey: $expression};

  } else if (_.isPlainObject($expression)) {
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

  } else {
    throw new Error(
      'Invalid $expression argument; ' +
      'expected plain value or array or object, received ' + type($expression)
    );
  }
}

Expression.prototype.toParamSQL = function (table) {
  var sql = [];
  var params = [];
  var key, value, expression, query;

  // check if $expression is null
  if (_.isNull(this._v)) return null;

  // extract key + value
  key = Object.keys(this._v)[0];
  value = this._v[key];

  if (key === '$and') {
    expression = new Expression.And(value);

  } else if (key === '$or') {
    expression = new Expression.Or(value);

  } else if (λ[key]) {
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

Expression.And = function ($and) {
  if (_.isArray($and)) {
    if (_.isEmpty($and)) throw new Error('Invalid $and argument; array cannot be empty');
    this._arr = $and;
  } else {
    throw new Error('Invalid $and argument; expected array, received ' + type($and));
  }
};

Expression.And.prototype.toParamSQL = function (table) {
  var params = [];
  var sql;

  sql = this._arr
    .map(function (e) {
      var expression = new Expression(e);
      var query = expression.toParamSQL(table);
      params = params.concat(query.params);
      return query.sql;
    })
    .join(' AND ');

  sql = '(' + sql + ')';

  return {sql: sql, params: params};
};

Expression.Or = function ($or) {
  if (_.isArray($or)) {
    if (_.isEmpty($or)) throw new Error('Invalid $or argument; array cannot be empty');
    this._arr = $or;
  } else {
    throw new Error('Invalid $or argument; expected array, received ' + type($or));
  }
};

Expression.Or.prototype.toParamSQL = function (table) {
  var params = [];
  var sql;

  sql = this._arr
    .map(function (e) {
      var expression = new Expression(e);
      var query = expression.toParamSQL(table);
      params = params.concat(query.params);
      return query.sql;
    })
    .join(' OR ');

  sql = '(' + sql + ')';

  return {sql: sql, params: params};
};

Expression.fromObject = function ($query) {
  return new Expression($query);
};

module.exports = Expression;
