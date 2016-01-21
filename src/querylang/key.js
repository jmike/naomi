import _ from 'lodash';
import type from 'type-of';
import CustomError from 'customerror';

class Key {

  /**
   * Parses the supplied value and returns an abstract syntax tree (ast).
   * @param {string} v value.
   * @return {Array}
   * @throws {QueryParseError} if method value could not be parsed.
   * @static
   */
  static parse(k: string): Array {
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

}

export default Key;
