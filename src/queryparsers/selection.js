import _ from 'lodash';
import type from 'type-of';
import parseEqual from './equal';
import parseNotEqual from './notEqual';
import parseGreaterThan from './greaterThan';
import parseGreaterThanOrEqual from './greaterThanOrEqual';
import parseLessThan from './lessThan';
import parseLessThanOrEqual from './lessThanOrEqual';
import parseLike from './like';
import parseNotLike from './notLike';
import parseIn from './in';
import parseNotIn from './notIn';
import parseAnd from './and';
import parseOr from './or';

/**
 * Parses the given selection expression and returns an abstract syntax tree (ast).
 * @param {Object} [expression] optional expression value.
 * @return {Array}
 */
function parse(expression: number | string | boolean | ?Object, _mem: ?string): Array {
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

    return parse({'$and': arr});
  }

  // check if expression has exactly 1 key
  if (keys.length === 1) {
    const k = keys[0];
    const v = expression[k];

    switch (k) {
    case '$eq':
      return ['SELECTION', parseEqual(_mem, v)];
    case '$ne':
      return ['SELECTION', parseNotEqual(_mem, v)];
    case '$gt':
      return ['SELECTION', parseGreaterThan(_mem, v)];
    case '$gte':
      return ['SELECTION', parseGreaterThanOrEqual(_mem, v)];
    case '$lt':
      return ['SELECTION', parseLessThan(_mem, v)];
    case '$lte':
      return ['SELECTION', parseLessThanOrEqual(_mem, v)];
    case '$like':
      return ['SELECTION', parseLike(_mem, v)];
    case '$nlike':
      return ['SELECTION', parseNotLike(_mem, v)];
    case '$in':
      return ['SELECTION', parseIn(_mem, v)];
    case '$nin':
      return ['SELECTION', parseNotIn(_mem, v)];
    case '$and':
      return ['SELECTION', parseAnd(v)];
    case '$or':
      return ['SELECTION', parseOr(v)];
    default:
      // check if value is a nested object
      if (_.isPlainObject(v)) {
        return parse(v, k);
      }

      // handle simple key-value assignment
      return parse({[k]: {$eq: v}});
    }
  }

  throw new TypeError(`Invalid selection expression; object must have at least 1 property`);
}

export default parse;
