var util = require('util');
var _ = require('lodash');
var Expression = require('./Expression');

function Filter($expression) {
  var keys;

  if (_.isPlainObject($expression)) {
    $expression = _.omit($expression, ['$projection', '$orderby', '$limit', '$offset', '$values']);

    keys = Object.keys($expression);

    if (keys.length === 0) {
      $expression = undefined;

    } else if (keys.length > 1) {
      $expression = {
        $and: keys.map(function (k) {
          return _.pick($expression, k);
        })
      };
    }

  } else if (_.isArray($expression)) {
    $expression = {$or: $expression};
  }

  Expression.call(this, $expression);
}

// @extends Expression
util.inherits(Filter, Expression);
_.extend(Filter, Expression);

module.exports = Filter;
