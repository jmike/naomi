import _ from 'lodash';
import type from 'type-of';
// import CustomError from 'customerror';

class QueryParser {

  constructor() {
    this.comparison = new Map();
    this.logical = new Map();
  }

  /**
   * Parses the supplied key expression and returns an abstract syntax tree (ast).
   * @param {string} expression.
   * @return {Array}
   */
  parseKey(expression: string): Array {
    const ast = ['KEY'];

    if (expression === '$id') {
      ast[0] = 'ID'; // replace completely
    } else if (_.isString(expression)) {
      ast.push(expression);
    } else {
      throw new TypeError(`Invalid key expression; expected string, received ${type(expression)}`);
    }

    return ast;
  }

  /**
   * Parses the given selection expression and returns an abstract syntax tree (ast).
   * @param {Object} [expression] optional expression value.
   * @return {Array}
   */
  parseSelection(expression: ?Object, _mem: ?string): Array {
    // check if expression is null or undefined
    if (_.isNil(expression)) {
      expression = {};
    }

    // check if expression is object
    if (!_.isPlainObject(expression)) {
      throw new TypeError(`Invalid selection expression; expected plain object, received ${type(expression)}`);
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

      return this.parseSelection({'$and': arr});
    }

    // check if expression has exactly 1 key
    if (keys.length === 1) {
      const k = keys[0];
      const v = expression[k];

      // check if key represents a comparison operator
      if (this.comparison.has(k)) {
        const arr = this.comparison.get(k)(_mem, v);
        return ['SELECTION', arr];
      }

      // check if key represents a logical operator
      if (this.logical.has(k)) {
        const arr = this.logical.get(k)(v);
        return ['SELECTION', arr];
      }

      // check if value is a nested object
      if (_.isPlainObject(v)) {
        return this.parseSelection(v, k);
      }

      // handle simple key-value assignment
      return this.parseSelection({[k]: {$eq: v}});
    }

    throw new TypeError(`Invalid selection expression; object must have at least 1 property`);
  }

  /**
   * Parses the given projection expression and returns an abstract syntax tree (ast).
   * @param {Object} [expression] optional expression value, e.g. {'foo': 1, 'bar': 1} or {'foo': -1}.
   * @return {Array}
   */
  parseProjection(expression: ?Object): Array {
    if (_.isNull(expression) || _.isUndefined(expression)) {
      return ['PROJECTION', null];
    }

    if (!_.isPlainObject(expression)) {
      throw new TypeError(`Invalid projection expression; expected plain object, received ${type(expression)}`);
    }

    const arr = Object.keys(expression).map((k) => {
      if (expression[k] === 1) {
        return ['INCLUDE', this.parseKey(k)];
      }

      if (expression[k] === 0 || expression[k] === -1) {
        return ['EXCLUDE', this.parseKey(k)];
      }

      throw new TypeError(`Invalid projection expression for key "${k}"; expected -1 or 1`);
    });

    return ['PROJECTION'].concat(arr);
  }

  /**
   * Parses the given orderby expression and returns an abstract syntax tree (ast).
   * @param {string, Object, Array<string, Object>} [expression] optional orderby expression.
   * @return {Array}
   */
  parseOrderBy(expression: ?string | Object | Array<string | Object>): Array {
    if (_.isNull(expression) || _.isUndefined(expression)) {
      return ['ORDERBY', null];
    }

    if (_.isString(expression) || _.isPlainObject(expression)) {
      expression = [expression];
    }

    const arr = expression.map((e, i) => {
      if (_.isString(e)) {
        return ['ASC', this.parseKey(e)];
      }

      const keys = Object.keys(e);

      if (keys.length === 0) {
        throw new TypeError(`Invalid orderby expression; object at position ${i} cannot be empty`);
      }

      if (keys.length > 1) {
        throw new TypeError(`Invalid orderby expression; object at position ${i} must contain exactly one property`);
      }

      const k = keys[0];
      const v = e[k];

      if (v !== 1 && v !== -1) {
        throw new TypeError(`Invalid orderby expression; object at position ${i} must have a value of -1 or 1`);
      }

      return [v === 1 ? 'ASC' : 'DESC', this.parseKey(k)];
    });

    return ['ORDERBY'].concat(arr);
  }

  /**
   * Parses the supplied limit expression and returns an abstract syntax tree (ast).
   * @param {number} [expression] optional limit expression - must be a positive integer.
   * @return {Array}
   */
  parseLimit(expression: ?number): Array {
    // check if expression is null or undefined
    if (_.isNil(expression)) {
      return ['LIMIT', null];
    }

    // make sure expression is a positive integer
    if (expression % 1 !== 0 || expression < 1) {
      throw new TypeError(`Invalid limit expression; expected positive integer, i.e. greater than 0`);
    }

    return ['LIMIT', expression];
  }

  /**
   * Parses the supplied offset expression and returns an abstract syntax tree (ast).
   * @param {number} [expression] optional offset expression - must be a positive integer.
   * @return {Array}
   */
  parseOffset(expression: ?number): Array {
    // check if expression is null or undefined
    if (_.isNil(expression)) {
      return ['OFFSET', null];
    }

    // make sure value is non-negative integer
    if (expression % 1 !== 0 || expression < 0) {
      throw new TypeError(`Invalid offset expression; expected non-negative integer, i.e. greater than or equal to 0`);
    }

    return ['OFFSET', expression];
  }

  /**
   * Parses a generic query expression and returns an abstract syntax tree (ast).
   * @param {Number, String, Date, Buffer, Boolean, Array, Object} [expression] optional query expression.
   * @return {Object}
   */
  parse(query: ?number | string | boolean | Object | Array): Object {
    // check if query is null or undefined
    if (_.isNull(query) || _.isUndefined(query)) {
      query = {};
    }

    // check if query is number, string, boolean, date or buffer
    if (_.isNumber(query) || _.isString(query) || _.isDate(query) || Buffer.isBuffer(query) || _.isBoolean(query)) {
      query = {'$id': {'$eq': query}};
    }

    // check if query is array
    if (_.isArray(query)) {
      query = {'$id': {'$in': query}};
    }

    return {
      selection: this.parseSelection(_.omit(query, ['$projection', '$orderby', '$limit', '$offset'])),
      projection: this.parseProjection(query.$projection),
      orderby: this.parseOrderBy(query.$orderby),
      limit: this.parseLimit(query.$limit),
      offset: this.parseOffset(query.$offset),
    };
  }
}

// create parser instance
const parser = new QueryParser();

parser.logical.set('$and', function (v: Array): Array {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid and expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid and expression; array cannot be empty`);
  }

  return ['AND'].concat(v.map((e) => {
    const selection = parser.parseSelection(e);
    return selection[1]; // remove the "SELECTION" part
  }));
});

parser.logical.set('$or', function (v: Array): Array {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid or expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid or expression; array cannot be empty`);
  }

  return ['OR'].concat(v.map((e) => {
    const selection = parser.parseSelection(e);
    return selection[1]; // remove the "SELECTION" part
  }));
});

parser.comparison.set('$eq', function (k: string, v: number | string | boolean | Date | ?Buffer): Array {
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

  return ['EQ', parser.parseKey(k), ['VALUE', v]];
});

parser.comparison.set('$ne', function (k: string, v: number | string | boolean | Date | ?Buffer): Array {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v) &&
    !_.isNull(v)
  ) {
    throw new TypeError(`Invalid $ne expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['NE', parser.parseKey(k), ['VALUE', v]];
});

parser.comparison.set('$gt', function (k: string, v: number | string | boolean | Date | Buffer): Array {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new TypeError(`Invalid $gt expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['GT', parser.parseKey(k), ['VALUE', v]];
});

parser.comparison.set('$gte', function (k: string, v: number | string | boolean | Date | Buffer): Array {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new TypeError(`Invalid $gte expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['GTE', parser.parseKey(k), ['VALUE', v]];
});

parser.comparison.set('$lt', function (k: string, v: number | string | boolean | Date | Buffer): Array {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new TypeError(`Invalid $lt expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['LT', parser.parseKey(k), ['VALUE', v]];
});

parser.comparison.set('$lte', function (k: string, v: number | string | boolean | Date | Buffer): Array {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new TypeError(`Invalid $lte expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['LTE', parser.parseKey(k), ['VALUE', v]];
});

parser.comparison.set('$in', function (k: string, v: Array): Array {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid $in expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid $in expression; array cannot be empty`);
  }

  return ['IN', parser.parseKey(k), ['VALUES'].concat(v)];
});

parser.comparison.set('$nin', function (k: string, v: Array): Array {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid $nin expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid $nin expression; array cannot be empty`);
  }

  return ['NIN', parser.parseKey(k), ['VALUES'].concat(v)];
});

parser.comparison.set('$like', function (k: string, v: string) {
  if (!_.isString(v)) {
    throw new TypeError(`Invalid $like expression; expected string, received ${type(v)}`);
  }

  return ['LIKE', parser.parseKey(k), ['VALUE', v]];
});

parser.comparison.set('$nlike', function (k: string, v: string) {
  if (!_.isString(v)) {
    throw new TypeError(`Invalid $nlike expression; expected string, received ${type(v)}`);
  }

  return ['NLIKE', parser.parseKey(k), ['VALUE', v]];
});

export default parser; // singleton
