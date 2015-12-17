import _ from 'lodash';
import type from 'type-of';
import CustomError from 'customerror';

import $and from './query-operators/and';
import $or from './query-operators/or';
import $eq from './query-operators/eq';
import $ne from './query-operators/ne';
import $gt from './query-operators/gt';
import $gte from './query-operators/gte';
import $lt from './query-operators/lt';
import $lte from './query-operators/lte';
import $in from './query-operators/in';
import $nin from './query-operators/nin';
import $like from './query-operators/like';
import $nlike from './query-operators/nlike';

class QueryParser {

  constructor() {
    this._comparison = new Map();
    this._logical = new Map();
  }

  /**
   * Parses and returns an AST (Abstract Syntax Tree) representation of the given expression.
   * @param {Number, String, Date, Buffer, Boolean, Array, Object} $expr
   * @throws {QueryParseError} if params are invalid or unspecified
   * @return {Array}
   */
  parse($expr: number | string | boolean | Object | Array, _mem: ?string): Array {
    // check if $expr is number, string, boolean, date of buffer
    if (_.isNumber($expr) || _.isString($expr) || _.isDate($expr) || Buffer.isBuffer($expr) || _.isBoolean($expr)) {
      return this.parse({$id: {$eq: $expr}});
    }

    // check if $expr is array
    if (_.isArray($expr)) {
      return this.parse({$id: {$in: $expr}});
    }

    // check if $expr is object
    if (_.isPlainObject($expr)) {
      const keys = _.keys($expr);

      // check if $expr has > 1 keys
      if (keys.length > 1) {
        return this.parse({$and: keys.map((k) => {
          return {[k]: $expr[k]};
        })}); // e.g. {a: 1, b: 2} => {$and: [{a: 1}, {b: 2}]}
      }

      // check if $expr has exactly 1 key
      if (keys.length === 1) {
        const k = keys[0];
        const v = $expr[k];

        // check if key is comparison operator
        if (this._comparison.has(k)) {
          return this._comparison.get(k)(_mem, v);
        }

        // check if key is logical operator
        if (this._logical.has(k)) {
          return this._logical.get(k)(v);
        }

        // check if value is nested object
        if (_.isPlainObject(v)) {
          return this.parse(v, k);
        }

        // handle simple key-value assignment
        return this.parse({[k]: {$eq: v}});
      }

      throw new CustomError(`Invalid expression; object must have at least 1 property`, 'QueryParseError');
    }

    throw new CustomError(`Invalid expression; expected number, string, boolean, date, buffer, array or object, received ${type($expr)}`, 'QueryParseError');
  }
}

// create parser instance
const parser = new QueryParser();

parser._logical.set('$and', $and);
parser._logical.set('$or', $or);

parser._comparison.set('$eq', $eq);
parser._comparison.set('$ne', $ne);
parser._comparison.set('$gt', $gt);
parser._comparison.set('$gte', $gte);
parser._comparison.set('$lt', $lt);
parser._comparison.set('$lte', $lte);
parser._comparison.set('$in', $in);
parser._comparison.set('$nin', $nin);
parser._comparison.set('$like', $like);
parser._comparison.set('$nlike', $nlike);

export default parser; // singleton
