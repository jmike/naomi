const _ = require('lodash');
const CustomError = require('customerror');
const type = require('type-of');

const QueryParser = require('../QueryParser');
const parseKey = require('./key');

function parse(k, v) {
  if (!_.isString(v)) {
    throw new CustomError(`Invalid $nlike expression; expected string, received ${type(v)}`, 'QueryParseError');
  }

  return ['NLIKE', parseKey(k), ['VALUE', v]];
}

QueryParser.registerComparisonOperator('$nlike', parse);

module.exports = parse;
