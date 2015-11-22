const _ = require('lodash');
const CustomError = require('customerror');
const type = require('type-of');

const QueryParser = require('../QueryParser');
const parseKey = require('./key');

function parse(k, v) {
  if (!_.isString(v)) {
    throw new CustomError(`Invalid $like expression; expected string, received ${type(v)}`, 'QueryParseError');
  }

  return ['LIKE', parseKey(k), ['VALUE', v]];
}

QueryParser.registerComparisonOperator('$like', parse);

module.exports = parse;
