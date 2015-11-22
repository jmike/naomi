const _ = require('lodash');
const CustomError = require('customerror');
const type = require('type-of');

const QueryParser = require('../QueryParser');

function parse(v) {
  if (!_.isArray(v)) {
    throw new CustomError(`Invalid $and expression; expected array, received ${type(v)}`, 'QueryParseError');
  }

  if (v.length === 0) {
    throw new CustomError(`Invalid $and expression; array cannot be empty`, 'QueryParseError');
  }

  return ['AND'].concat(v.map((e) => QueryParser.parse(e)));
}

QueryParser.registerLogicalOperator('$and', parse);

module.exports = parse;
