import _ from 'lodash';
import type from 'type-of';
import CustomError from 'customerror';
import Eq from './Eq';
import In from './In';
import And from './And';
import Or from './Or';

const comparison = new Map();
comparison.set('$eq', Eq);
comparison.set('$in', In);

const logical = new Map();
logical.set('$and', And);
logical.set('$or', Or);

class Expr {

  static parse($expr, m) {
    // check if $expr is number, string, boolean, date of buffer
    if (_.isNumber($expr) || _.isString($expr) || _.isDate($expr) || Buffer.isBuffer($expr) || _.isBoolean($expr)) {
      return Expr.parse({$id: {$eq: $expr}});
    }

    // check if $expr is array
    if (_.isArray($expr)) {
      return Expr.parse({$id: {$in: $expr}});
    }

    // check if $expr is object
    if (_.isPlainObject($expr)) {
      const keys = _.keys($expr);

      // check if $expr has > 1 keys
      if (keys.length > 1) {
        return Expr.parse({$and: keys.map((k) => {
          return {[k]: $expr[k]};
        })}); // e.g. {a: 1, b: 2} => {$and: [{a: 1}, {b: 2}]}
      }

      // check if $expr has exactly 1 key
      if (keys.length === 1) {
        const k = keys[0];
        const v = $expr[k];

        // check if key is comparison operator
        if (comparison.has(k)) {
          return comparison.get(k).parse(m, v);
        }

        // check if key is logical operator
        if (logical.has(k)) {
          return logical.get(k).parse(v);
        }

        // check if value is nested object
        if (_.isPlainObject(v)) {
          return Expr.parse(v, k);
        }

        // handle simple key-value assignment
        return Expr.parse({[k]: {$eq: v}});
      }

      throw new CustomError(`Invalid expression; object must have at least 1 property`, 'QueryParseError');
    }

    throw new CustomError(`Invalid expression; expected number, string, boolean, date, buffer, array or object, received ${type($expr)}`, 'QueryParseError');
  }

}

export default Expr;
