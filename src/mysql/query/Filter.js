var _ = require('lodash');
var expression = require('./expression');

module.exports = function ($expression, table) {
  var keys;

  if (_.isPlainObject($expression)) {
    $expression = _.omit($expression, ['$projection', '$orderby', '$limit', '$offset', '$values']);

    keys = Object.keys($expression);

    if (keys.length > 1) {
      $expression = {
        $and: keys.map(function (k) {
          return _.pick($expression, k);
        })
      };
    }

  } else if (_.isArray($expression)) {
    $expression = {$or: $expression};
  }

  return expression($expression, table);
};
