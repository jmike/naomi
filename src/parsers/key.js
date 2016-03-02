import _ from 'lodash';
import type from 'type-of';

/**
 * Parses the supplied key expression and returns an abstract syntax tree (ast).
 * @param {string} expression.
 * @return {Array}
 */
function parse(expression: string): Array {
  const ast = ['KEY'];

  if (expression === '$id') {
    ast[0] = 'ID'; // replace completely
  } else if (_.isString(expression)) {
    ast.push(expression);
  } else {
    throw new TypeError(`Invalid key expression; expected string, received ${type(expression)}`);
  }

  return ast;
}

export default parse;
