var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');

var λ = {
  $and: require('./expression.and')(expression),
  $or: require('./expression.or')(expression),
  $eq: require('./expression.eq')(expression),
  $ne: require('./expression.ne')(expression),
  $lt: require('./expression.lt')(expression),
  $lte: require('./expression.lte')(expression),
  $gt: require('./expression.gt')(expression),
  $gte: require('./expression.gte')(expression),
  $in: require('./expression.in')(expression),
  $nin: require('./expression.nin')(expression),
  $like: require('./expression.like')(expression),
  $nlike: require('./expression.nlike')(expression),
  $id: require('./expression.id')(expression)
};

function expression($expression, table) {
  var sql = [];
  var params = [];
  var key, value, result;

  if (_.isUndefined($expression)) {
    return {sql: '', params: []};

  } else if (_.isPlainObject($expression)) {
    // check if $expression is empty
    if (_.isEmpty($expression)) {
      return {sql: '', params: []};
    }

    // extract key + value
    key = Object.keys($expression)[0];
    value = $expression[key];

    // check if key is known expression
    if (λ[key]) {
      return λ[key](value, table);
    }

    // make sure key is a valid column
    if (!table.hasColumn(key)) {
      throw new Error('Unknown column "' + key + '"; not found in table "' + table.name + '"');
    }

    sql.push(escape(key));

    if (_.isPlainObject(value)) {
      result = expression(value, table);
    } else {
      result = λ.$eq(value, table);
    }

    sql.push(result.sql);
    params = params.concat(result.params);

    return {sql: sql.join(' '), params: params};

  } else if (
    _.isNumber($expression) ||
    _.isString($expression) ||
    _.isBoolean($expression) ||
    _.isDate($expression) ||
    Buffer.isBuffer($expression)
  ) {
    return λ.$id($expression, table);

  } else {
    throw new Error(
      'Invalid $expression argument; ' +
      'expected object, number, string, boolean, date, buffer or undefined, received ' + type($expression)
    );
  }
}

module.exports = expression;
