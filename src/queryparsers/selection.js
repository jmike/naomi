import _ from 'lodash';
import type from 'type-of';
import parseKey from './key';

function parseEqual(k, v) {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v) &&
    !_.isNull(v)
  ) {
    throw new TypeError(`Invalid $eq expression; expected number, string, boolean, date, buffer or null, received ${type(v)}`);
  }

  return ['EQ', parseKey(k), ['VALUE', v]];
}

function parseNotEqual(k, v) {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v) &&
    !_.isNull(v)
  ) {
    throw new TypeError(`Invalid $ne expression; expected number, string, boolean, date, buffer or null, received ${type(v)}`);
  }

  return ['NE', parseKey(k), ['VALUE', v]];
}

function parseGreaterThan(k, v): Array {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new TypeError(`Invalid $gt expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['GT', parseKey(k), ['VALUE', v]];
}

function parseGreaterThanOrEqual(k, v) {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new TypeError(`Invalid $gte expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['GTE', parseKey(k), ['VALUE', v]];
}

function parseLessThan(k, v) {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new TypeError(`Invalid $lt expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['LT', parseKey(k), ['VALUE', v]];
}

function parseLessThanOrEqual(k, v) {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new TypeError(`Invalid $lte expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['LTE', parseKey(k), ['VALUE', v]];
}

function parseLike(k, v) {
  if (!_.isString(v)) {
    throw new TypeError(`Invalid $like expression; expected string, received ${type(v)}`);
  }

  return ['LIKE', parseKey(k), ['VALUE', v]];
}

function parseNotLike(k, v) {
  if (!_.isString(v)) {
    throw new TypeError(`Invalid $nlike expression; expected string, received ${type(v)}`);
  }

  return ['NLIKE', parseKey(k), ['VALUE', v]];
}

function parseIn(k, v) {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid $in expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid $in expression; array cannot be empty`);
  }

  return ['IN', parseKey(k), ['VALUES'].concat(v)];
}

function parseNotIn(k, v) {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid $nin expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid $nin expression; array cannot be empty`);
  }

  return ['NIN', parseKey(k), ['VALUES'].concat(v)];
}

function parseAnd(v) {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid $and expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid $and expression; array cannot be empty`);
  }

  return ['AND'].concat(v.map((e) => {
    const selection = parse(e); // eslint-disable-line no-use-before-define
    return selection[1]; // remove the "SELECTION" part
  }));
}

function parseOr(v) {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid $or expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid $or expression; array cannot be empty`);
  }

  return ['OR'].concat(v.map((e) => {
    const selection = parse(e); // eslint-disable-line no-use-before-define
    return selection[1]; // remove the "SELECTION" part
  }));
}

/**
 * Parses the given selection expression and returns an abstract syntax tree (ast).
 * @param {Object} [expression] optional expression value.
 * @return {Array}
 */
function parse(expression, _mem) {
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
    expression = {'$or': expression};
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
