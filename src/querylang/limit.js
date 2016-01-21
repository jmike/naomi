import _ from 'lodash';
import CustomError from 'customerror';

class Limit {

  /**
   * Parses the supplied $limit value and returns an abstract syntax tree (ast).
   * @param {number} [$limit] optional limit value - must be a positive integer.
   * @return {Array}
   * @throws {QueryParseError} if method value could not be parsed.
   * @static
   */
  static parse($limit: ?number): Array {
    if (_.isNull($limit) || _.isUndefined($limit)) {
      return ['LIMIT', null];
    }

    // make sure value is positive integer
    if ($limit % 1 !== 0 || $limit < 1) {
      throw new CustomError(`Invalid $limit expression; expected positive integer, i.e. greater than 0`, 'QueryParseError');
    }

    return ['LIMIT', $limit];
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

export default Limit;
