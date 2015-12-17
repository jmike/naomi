import _ from 'lodash';
import type from 'type-of';
import CustomError from 'customerror';

export default function(k) {
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
