import _ from 'lodash';
import CustomError from 'customerror';
// import type from 'type-of';
import key from './key';

class OrderBy {

  /**
   * Parses the supplied $orderby expression and returns an abstract syntax tree (ast).
   * @param {string, Object, Array<string, Object>} [$orderby] optional $orderby expression.
   * @return {Array}
   * @throws {QueryParseError} if method value could not be parsed.
   * @static
   */
  static parse($orderby: ?string | Object | Array<string | Object>): Array {
    if (_.isNull($orderby) || _.isUndefined($orderby)) {
      return ['ORDERBY', null];
    }

    if (_.isString($orderby) || _.isPlainObject($orderby)) {
      $orderby = [$orderby];
    }

    const arr = $orderby.map((e, i) => {
      if (_.isString(e)) {
        return ['ASC', key.parse(e)];
      }

      const keys = Object.keys(e);

      if (keys.length === 0) {
        throw new CustomError(`Invalid $orderby element at position ${i}; object cannot be empty`, 'QueryParseError');
      }

      if (keys.length > 1) {
        throw new CustomError(`Invalid $orderby element at position ${i}; object must contain exactly one property`, 'QueryParseError');
      }

      const k = keys[0];
      const v = e[k];

      if (v !== 1 && v !== -1) {
        throw new CustomError(`Invalid $orderby element at position ${i}; value must be either -1 or 1`, 'QueryParseError');
      }

      return [v === 1 ? 'ASC' : 'DESC', key.parse(k)];
    });

    return ['ORDERBY'].concat(arr);
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

export default OrderBy;
