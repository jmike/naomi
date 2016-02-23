import _ from 'lodash';
import type from 'type-of';
import Schema from './Schema';

class QueryParser {

  /**
   * Constructs a new QueryCompiler instance for the designated collection.
   * @param {string} name the name of the collection.
   * @param {Schema} schema the schema of the collection.
   * @constructor
   */
  constructor(name: string, schema: Schema) {
    this.name = name;
    this.schema = schema;
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

  parseAnd(v: Array): Array {
    if (!_.isArray(v)) {
      throw new TypeError(`Invalid and expression; expected array, received ${type(v)}`);
    }

    if (v.length === 0) {
      throw new TypeError(`Invalid and expression; array cannot be empty`);
    }

    return ['AND'].concat(v.map((e) => {
      const selection = this.parseSelection(e);
      return selection[1]; // remove the "SELECTION" part
    }));
  }

  parseOr(v: Array): Array {
    if (!_.isArray(v)) {
      throw new TypeError(`Invalid or expression; expected array, received ${type(v)}`);
    }

    if (v.length === 0) {
      throw new TypeError(`Invalid or expression; array cannot be empty`);
    }

    return ['OR'].concat(v.map((e) => {
      const selection = this.parseSelection(e);
      return selection[1]; // remove the "SELECTION" part
    }));
  }

  parseEqual(k: string, v: number | string | boolean | Date | ?Buffer): Array {
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

    return ['EQ', this.parseKey(k), ['VALUE', v]];
  }

  parseNotEqual(k: string, v: number | string | boolean | Date | ?Buffer): Array {
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

    return ['NE', this.parseKey(k), ['VALUE', v]];
  }

  parseGreaterThan(k: string, v: number | string | boolean | Date | Buffer): Array {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v)
    ) {
      throw new TypeError(`Invalid $gt expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
    }

    return ['GT', this.parseKey(k), ['VALUE', v]];
  }

  parseGreaterThanOrEqual(k: string, v: number | string | boolean | Date | Buffer): Array {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v)
    ) {
      throw new TypeError(`Invalid $gte expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
    }

    return ['GTE', this.parseKey(k), ['VALUE', v]];
  }

  parseLessThan(k: string, v: number | string | boolean | Date | Buffer): Array {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v)
    ) {
      throw new TypeError(`Invalid $lt expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
    }

    return ['LT', this.parseKey(k), ['VALUE', v]];
  }

  parseLessThanOrEqual(k: string, v: number | string | boolean | Date | Buffer): Array {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v)
    ) {
      throw new TypeError(`Invalid $lte expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
    }

    return ['LTE', this.parseKey(k), ['VALUE', v]];
  }

  parseIn(k: string, v: Array): Array {
    if (!_.isArray(v)) {
      throw new TypeError(`Invalid $in expression; expected array, received ${type(v)}`);
    }

    if (v.length === 0) {
      throw new TypeError(`Invalid $in expression; array cannot be empty`);
    }

    return ['IN', this.parseKey(k), ['VALUES'].concat(v)];
  }

  parseNotIn(k: string, v: Array): Array {
    if (!_.isArray(v)) {
      throw new TypeError(`Invalid $nin expression; expected array, received ${type(v)}`);
    }

    if (v.length === 0) {
      throw new TypeError(`Invalid $nin expression; array cannot be empty`);
    }

    return ['NIN', this.parseKey(k), ['VALUES'].concat(v)];
  }

  parseLike(k: string, v: string) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid $like expression; expected string, received ${type(v)}`);
    }

    return ['LIKE', this.parseKey(k), ['VALUE', v]];
  }

  parseNotLike(k: string, v: string) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid $nlike expression; expected string, received ${type(v)}`);
    }

    return ['NLIKE', this.parseKey(k), ['VALUE', v]];
  }

  /**
   * Parses the given selection expression and returns an abstract syntax tree (ast).
   * @param {Object} [expression] optional expression value.
   * @return {Array}
   */
  parseSelection(expression: number | string | boolean | ?Object, _mem: ?string): Array {
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

      return this.parseSelection({'$and': arr});
    }

    // check if expression has exactly 1 key
    if (keys.length === 1) {
      const k = keys[0];
      const v = expression[k];

      switch (k) {
      case '$eq':
        return ['SELECTION', this.parseEqual(_mem, v)];
      case '$ne':
        return ['SELECTION', this.parseNotEqual(_mem, v)];
      case '$gt':
        return ['SELECTION', this.parseGreaterThan(_mem, v)];
      case '$gte':
        return ['SELECTION', this.parseGreaterThanOrEqual(_mem, v)];
      case '$lt':
        return ['SELECTION', this.parseLessThan(_mem, v)];
      case '$lte':
        return ['SELECTION', this.parseLessThanOrEqual(_mem, v)];
      case '$like':
        return ['SELECTION', this.parseLike(_mem, v)];
      case '$nlike':
        return ['SELECTION', this.parseNotLike(_mem, v)];
      case '$in':
        return ['SELECTION', this.parseIn(_mem, v)];
      case '$nin':
        return ['SELECTION', this.parseNotIn(_mem, v)];
      case '$and':
        return ['SELECTION', this.parseAnd(v)];
      case '$or':
        return ['SELECTION', this.parseOr(v)];
      default:
        // check if value is a nested object
        if (_.isPlainObject(v)) {
          return this.parseSelection(v, k);
        }

        // handle simple key-value assignment
        return this.parseSelection({[k]: {$eq: v}});
      }
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
   * Parses the supplied limit and returns an abstract syntax tree (ast).
   * @param {number} [limit] a positive integer.
   * @return {Array}
   */
  parseLimit(limit: ?number): Array {
    // check if limit is null or undefined
    if (_.isNil(limit)) {
      return ['LIMIT', null];
    }

    // make sure limit is a positive integer
    if (limit % 1 !== 0 || limit < 1) {
      throw new TypeError(`Invalid limit argument; expected positive integer (i.e. greater than 0)`);
    }

    return ['LIMIT', limit];
  }

  /**
   * Parses the supplied offset and returns an abstract syntax tree (ast).
   * @param {number} [offset] a non-negative integer.
   * @return {Array}
   */
  parseOffset(offset: ?number): Array {
    // check if offset is null or undefined
    if (_.isNil(offset)) {
      return ['OFFSET', null];
    }

    // make sure value is non-negative integer
    if (offset % 1 !== 0 || offset < 0) {
      throw new TypeError(`Invalid offset argument; expected non-negative integer (i.e. greater than or equal to 0)`);
    }

    return ['OFFSET', offset];
  }
}

export default QueryParser;
