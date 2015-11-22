const _ = require('lodash');
const CustomError = require('customerror');
const type = require('type-of');

const QueryParser = require('../QueryParser');
const parseKey = require('./key');

function parse(k, v) {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new CustomError(`Invalid $lte expression; expected number, string, boolean, date or buffer, received ${type(v)}`, 'QueryParseError');
  }

  return ['LTE', parseKey(k), ['VALUE', v]];
}

QueryParser.registerComparisonOperator('$lte', parse);

module.exports = parse;
