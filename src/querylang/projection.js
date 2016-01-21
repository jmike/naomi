import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import key from './key';

class Projection {

  /**
   * Parses the supplied $projection expression and returns an abstract syntax tree (ast).
   * @param {Object} [$projection] optional projection value, e.g. {'foo': 1, 'bar': 1} or {'foo': -1}.
   * @return {Array}
   * @throws {QueryParseError} if the supplied $projection expression could not be parsed.
   * @static
   */
  static parse($projection: ?Object): Array {
    if (_.isNull($projection) || _.isUndefined($projection)) {
      return ['PROJECTION', null];
    }

    if (!_.isPlainObject($projection)) {
      throw new TypeError(`Invalid $projection expression; expected plain object, received ${type($projection)}`);
    }

    const arr = Object.keys($projection).map((k) => {
      if ($projection[k] === 1) {
        return ['INCLUDE', key.parse(k)];
      }

      if ($projection[k] === 0 || $projection[k] === -1) {
        return ['EXCLUDE', key.parse(k)];
      }

      throw new CustomError(`Invalid $projection expression for key "${k}"; expected -1 or 1`, 'QueryParseError');
    });

    return ['PROJECTION'].concat(arr);
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

export default Projection;
