var util = require('util');
var _ = require('lodash');
var Expression = require('./Expression');

function Filter($expression) {
  if (_.isPlainObject($expression)) {
    $expression = _.omit($expression, ['$projection', '$orderby', '$limit', '$offset', '$values']);
  }

  Expression.call(this, $expression);
}

// @extends Expression
util.inherits(Filter, Expression);
_.extend(Filter, Expression);

module.exports = Filter;
