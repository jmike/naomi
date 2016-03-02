import _ from 'lodash';
import type from 'type-of';
import Equal from './Equal';
import NotEqual from './NotEqual';
import GreaterThan from './GreaterThan';
import GreaterThanOrEqual from './GreaterThanOrEqual';
import LessThan from './LessThan';
import LessThanOrEqual from './LessThanOrEqual';
import Like from './Like';
import NotLike from './NotLike';
import In from './In';
import NotIn from './NotIn';
import And from './And';
import Or from './Or';

class Selection {

  /**
   * Parses the given selection expression and returns an abstract syntax tree (ast).
   * @param {Object} [expression] optional expression value.
   * @return {Array}
   * @static
   */
  static parse(expression: number | string | boolean | ?Object, _mem: ?string): Array {
    if (_.isNil(expression)) { // null or undefined
      expression = {};
    } else if (
      _.isNumber(expression) ||
      _.isString(expression) ||
      _.isDate(expression) ||
      _.isBoolean(expression) ||
      Buffer.isBuffer(expression)) {
      expression = {'$id': {'$eq': expression}};
    } else if (_.isArray(expression)) {
      expression = {'$id': {'$in': expression}};
    } else if (!_.isPlainObject(expression)) {
      throw new TypeError(`Invalid selection expression; expected number, string, date, boolean, buffer, array or plain object, received ${type(expression)}`);
    }

    // extract object keys
    const keys = _.keys(expression);

    // check if expression is empty
    if (keys.length === 0) {
      return ['SELECTION', null];
    }

    // check if expression has more than 1 keys
    if (keys.length > 1) {
      // split in key-value pairs, e.g. {a: 1, b: 2} => [{a: 1}, {b: 2}]
      const arr = keys.map((k) => {
        return {[k]: expression[k]};
      });

      return this.parse({'$and': arr});
    }

    // check if expression has exactly 1 key
    if (keys.length === 1) {
      const k = keys[0];
      const v = expression[k];

      switch (k) {
      case '$eq':
        return ['SELECTION', Equal.parse(_mem, v)];
      case '$ne':
        return ['SELECTION', NotEqual.parse(_mem, v)];
      case '$gt':
        return ['SELECTION', GreaterThan.parse(_mem, v)];
      case '$gte':
        return ['SELECTION', GreaterThanOrEqual.parse(_mem, v)];
      case '$lt':
        return ['SELECTION', LessThan.parse(_mem, v)];
      case '$lte':
        return ['SELECTION', LessThanOrEqual.parse(_mem, v)];
      case '$like':
        return ['SELECTION', Like.parse(_mem, v)];
      case '$nlike':
        return ['SELECTION', NotLike.parse(_mem, v)];
      case '$in':
        return ['SELECTION', In.parse(_mem, v)];
      case '$nin':
        return ['SELECTION', NotIn.parse(_mem, v)];
      case '$and':
        return ['SELECTION', And.parse(v)];
      case '$or':
        return ['SELECTION', Or.parse(v)];
      default:
        // check if value is a nested object
        if (_.isPlainObject(v)) {
          return this.parse(v, k);
        }

        // handle simple key-value assignment
        return this.parse({[k]: {$eq: v}});
      }
    }

    throw new TypeError(`Invalid selection expression; object must have at least 1 property`);
  }

}

export default Selection;
