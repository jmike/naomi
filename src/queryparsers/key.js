import _ from 'lodash';
import type from 'type-of';

function parse(key) {
  const ast = ['KEY'];

  if (key === '$id') {
    ast[0] = 'ID'; // replace completely
  } else if (_.isString(key)) {
    ast.push(key);
  } else {
    throw new TypeError(`Invalid "key" argument; expected string, received ${type(key)}`);
  }

  return ast;
}

export default parse;
