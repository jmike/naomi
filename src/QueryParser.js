import _ from 'lodash';
import type from 'type-of';
// import CustomError from 'customerror';

import $and from './querylang/and';
import $or from './querylang/or';
import $eq from './querylang/eq';
import $ne from './querylang/ne';
import $gt from './querylang/gt';
import $gte from './querylang/gte';
import $lt from './querylang/lt';
import $lte from './querylang/lte';
import $in from './querylang/in';
import $nin from './querylang/nin';
import $like from './querylang/like';
import $nlike from './querylang/nlike';

import $projection from './querylang/projection';
import $orderby from './querylang/orderby';
import $limit from './querylang/limit';
import $offset from './querylang/offset';

class QueryParser {

  constructor() {
    this.comparison = new Map();
    this.logical = new Map();
  }

  /**
   * Parses the given selection expression and returns an abstract syntax tree (ast).
   * @param {Object} [expression] optional expression value.
   * @return {Array}
   * @throws {QueryParseError} if the supplied expression could not be parsed.
   * @static
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
        const arr = this.comparison.get(k).parse(_mem, v);
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
   * Parses the supplied query expression and returns an abstract syntax tree (ast).
   * @param {Number, String, Date, Buffer, Boolean, Array, Object} [$expr] optional expression.
   * @return {Object}
   * @throws {QueryParseError} if the supplied expression is invalid.
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
      projection: $projection.parse(query.$projection),
      orderby: $orderby.parse(query.$orderby),
      limit: $limit.parse(query.$limit),
      offset: $offset.parse(query.$offset),
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

parser.comparison.set('$eq', $eq);
parser.comparison.set('$ne', $ne);
parser.comparison.set('$gt', $gt);
parser.comparison.set('$gte', $gte);
parser.comparison.set('$lt', $lt);
parser.comparison.set('$lte', $lte);
parser.comparison.set('$in', $in);
parser.comparison.set('$nin', $nin);
parser.comparison.set('$like', $like);
parser.comparison.set('$nlike', $nlike);

export default parser; // singleton
