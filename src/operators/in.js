const _ = require('lodash');
const CustomError = require('customerror');
const type = require('type-of');

const QueryParser = require('../QueryParser');
const parseKey = require('./key');

function parse(k, v) {
  if (!_.isArray(v)) {
    throw new CustomError(`Invalid $in expression; expected array, received ${type(v)}`, 'QueryParseError');
  }

  if (v.length === 0) {
    throw new CustomError(`Invalid $in expression; array cannot be empty`, 'QueryParseError');
  }

  return ['IN', parseKey(k), ['VALUES'].concat(v)];
}

QueryParser.registerComparisonOperator('$in', parse);

module.exports = parse;
