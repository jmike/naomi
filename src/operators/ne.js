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
    !Buffer.isBuffer(v) &&
    !_.isNull(v)
  ) {
    throw new CustomError(`Invalid $ne expression; expected number, string, boolean, date or buffer, received ${type(v)}`, 'QueryParseError');
  }

  return ['NE', parseKey(k), ['VALUE', v]];
}

QueryParser.registerComparisonOperator('$ne', parse);

module.exports = parse;
