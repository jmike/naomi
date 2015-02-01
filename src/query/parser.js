var _ = require('lodash');
var projection = require('./projection.js');
var limit = require('./limit.js');
var offset = require('./offset.js');
var orderby = require('./orderby.js');

exports.parse = function ($query) {
  var results = {};

  // handle optional $query argument
  if (_.isUndefined($query)) {
    $query = {};
  }

  projection.visit(results, $query.$projection);
  orderby.visit(results, $query.$orderby || $query.$sort);
  limit.visit(results, $query.$limit);
  offset.visit(results, $query.$offset || $query.$skip);

  results.$filter = _.omit($query, [
    '$projection',
    '$orderby',
    '$limit',
    '$offset'
  ]);

  return results;
};