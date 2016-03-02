import _ from 'lodash';
import type from 'type-of';
import Key from './Key';

class Projection {

  /**
   * Parses the given projection expression and returns an abstract syntax tree (ast).
   * @param {Object} [expression] optional expression value, e.g. {'foo': 1, 'bar': 1} or {'foo': -1}.
   * @return {Array}
   * @static
   */
  static parse(expression: ?Object): Array {
    if (_.isNull(expression) || _.isUndefined(expression)) {
      return ['PROJECTION', null];
    }

    if (!_.isPlainObject(expression)) {
      throw new TypeError(`Invalid projection expression; expected plain object, received ${type(expression)}`);
    }

    const arr = Object.keys(expression).map((k) => {
      if (expression[k] === 1) {
        return ['INCLUDE', Key.parse(k)];
      }

      if (expression[k] === 0 || expression[k] === -1) {
        return ['EXCLUDE', Key.parse(k)];
      }

      throw new TypeError(`Invalid projection expression for key "${k}"; expected -1 or 1`);
    });

    return ['PROJECTION'].concat(arr);
  }

}

export default Projection;
