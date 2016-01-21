import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import key from './key';

class GreaterThanOrEqual {

  /**
   * Parses the supplied key-value pair and returns an abstract syntax tree (ast).
   * @param {string} k key.
   * @param {string, number, boolean, Date, Buffer} v value.
   * @return {Array}
   * @throws {QueryParseError} if method value could not be parsed.
   * @static
   */
  static parse(k: string, v: number | string | boolean | Date | Buffer): Array {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v)
    ) {
      throw new CustomError(`Invalid $gte expression; expected number, string, boolean, date or buffer, received ${type(v)}`, 'QueryParseError');
    }

    return ['GTE', key.parse(k), ['VALUE', v]];
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

export default GreaterThanOrEqual;
