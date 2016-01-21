import _ from 'lodash';
import CustomError from 'customerror';

class Offset {

  /**
   * Parses the supplied $offset value and returns an abstract syntax tree (ast).
   * @param {number} [$offset] optional offset value - must be a positive integer.
   * @return {Array}
   * @throws {QueryParseError} if method value could not be parsed.
   * @static
   */
  static parse($offset: ?number): Array {
    if (_.isNull($offset) || _.isUndefined($offset)) {
      return ['OFFSET', null];
    }

    // make sure value is non-negative integer
    if ($offset % 1 !== 0 || $offset < 0) {
      throw new CustomError(`Invalid $offset value; expected non-negative integer, i.e. greater than or equal to 0`, 'QueryParseError');
    }

    return ['OFFSET', $offset];
  }

  /**
   * Builds and returns a parameterized query based on the supplied abstract syntax tree (ast).
   * @param {Array} ast an abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   * @static
   */
  static build(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

}

export default Offset;
