var _ = require('lodash');

exports.parse = function ($query) {
  var $filter = _.omit($query, ['$projection', '$orderby', '$limit', '$offset', '$values']);
  var keys = Object.keys($filter);
  var $and;

  if (keys.length > 1) {
    $and = keys.map(function (k) {
      var obj = {};
      obj[k] = $filter[k];
      return obj;
    });

    return {$and: $and};
  }

  return $filter;
};

exports.visit = function (results, $query) {
  results.$filter = exports.parse($query);
};
