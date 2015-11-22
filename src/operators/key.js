const _ = require('lodash');
const type = require('type-of');
const CustomError = require('customerror');

function parse(k) {
  const ast = ['KEY'];

  if (k === '$id') {
    ast[0] = 'ID'; // replace completely
  } else if (_.isString(k)) {
    ast.push(k);
  } else {
    throw new CustomError(`Invalid key param; expected string, received ${type(k)}`, 'QueryParseError');
  }

  return ast;
}

module.exports = parse;
