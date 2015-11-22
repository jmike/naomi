const _ = require('lodash');
const CustomError = require('customerror');
const type = require('type-of');

const QueryParser = require('../QueryParser');

function parse(v) {
  if (!_.isArray(v)) {
    throw new CustomError(`Invalid $or expression; expected array, received ${type(v)}`, 'QueryParseError');
  }

  if (v.length === 0) {
    throw new CustomError(`Invalid $or expression; array cannot be empty`, 'QueryParseError');
  }

  return ['OR'].concat(v.map((e) => QueryParser.parse(e)));
}

QueryParser.registerLogicalOperator('$or', parse);

module.exports = parse;
