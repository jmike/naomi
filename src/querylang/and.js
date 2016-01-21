import CustomError from 'customerror';
import selection from './selection';

class And {

  /**
   * Parses the supplied value and returns an abstract syntax tree (ast).
   * @param {Array} v value.
   * @return {Array}
   * @throws {QueryParseError} if method value could not be parsed.
   * @static
   */
  static parse(v: Array): Array {
    if (v.length === 0) {
      throw new CustomError(`Invalid $and expression; array cannot be empty`, 'QueryParseError');
    }

    return ['AND'].concat(v.map((e) => selection.parse(e)));
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

export default And;
