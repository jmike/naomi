var _ = require('lodash');
var type = require('type-of');
var projection = require('./projection.js');
var limit = require('./limit.js');
var offset = require('./offset.js');
var orderby = require('./orderby.js');
var filter = require('./filter.js');
var values = require('./values.js');

exports.parse = function ($query) {
  var results = {};

  // handle optional $query argument
  if (_.isUndefined($query)) {
    $query = {};
  }

  // check if $query is plain value
  if (_.isNumber($query) || _.isString($query) || _.isBoolean($query) || _.isDate($query) || Buffer.isBuffer($query)) {
    $query = {$primarykey: $query};
  }

  // check if $query is Array
  if (_.isArray($query) && $query.length !== 0) {
    $query = {$or: $query.map(function (e) { return e; })};
  }

  // validate $query
  if (!_.isPlainObject($query)) {
    throw new Error('Invalid $query argument; expected plain value or array or object, received ' + type($query));
  }

  // parse $query
  projection.visit(results, $query.$projection);
  orderby.visit(results, $query.$orderby || $query.$sort);
  limit.visit(results, $query.$limit);
  offset.visit(results, $query.$offset || $query.$skip);
  values.visit(results, $query.$values);
  filter.visit(results, $query);

  return results;
};
