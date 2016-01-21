import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';

import $and from './and';
import $or from './or';
import $eq from './eq';
import $ne from './ne';
import $gt from './gt';
import $gte from './gte';
import $lt from './lt';
import $lte from './lte';
import $in from './in';
import $nin from './nin';
import $like from './like';
import $nlike from './nlike';

const logicalOperators = new Map();
logicalOperators.set('$and', $and);
logicalOperators.set('$or', $or);

const comparisonOperators = new Map();
comparisonOperators.set('$eq', $eq);
comparisonOperators.set('$ne', $ne);
comparisonOperators.set('$gt', $gt);
comparisonOperators.set('$gte', $gte);
comparisonOperators.set('$lt', $lt);
comparisonOperators.set('$lte', $lte);
comparisonOperators.set('$in', $in);
comparisonOperators.set('$nin', $nin);
comparisonOperators.set('$like', $like);
comparisonOperators.set('$nlike', $nlike);

class Projection {

  /**
   * Parses the supplied $projection expression and returns an abstract syntax tree (ast).
   * @param {Object} [$projection] optional projection value, e.g. {'foo': 1, 'bar': 1} or {'foo': -1}.
   * @return {Array}
   * @throws {QueryParseError} if the supplied $projection expression could not be parsed.
   * @static
   */
  static parse($selection: ?Object, _mem: ?string): Array {
    if (_.isNull($selection) || _.isUndefined($selection)) {
      $selection = {};
    }

    // check if $selection is object
    if (!_.isPlainObject($selection)) {
      throw new TypeError(`Invalid $selection expression; expected plain object, received ${type($selection)}`);
    }

    const keys = _.keys($selection);

    // check if $selection is empty
    if (keys.length === 0) {
      return ['SELECTION', null];
    }

    // check if $selection has > 1 keys
    if (keys.length > 1) {
      const arr = keys.map((k) => {
        return {[k]: $selection[k]};
      }); // e.g. {a: 1, b: 2} => [{a: 1}, {b: 2}]

      return this.parse({'$and': arr});
    }

    // check if $selection has exactly 1 key
    if (keys.length === 1) {
      const k = keys[0];
      const v = $selection[k];

      // check if key is comparison operator
      if (this.comparisonOperators.has(k)) {
        const arr = this.comparisonOperators.get(k).parse(_mem, v);
        return ['SELECTION', arr];
      }

      // check if key is logical operator
      if (this.logicalOperators.has(k)) {
        const arr = this.logicalOperators.get(k).parse(v);
        return ['SELECTION', arr];
      }

      // check if value is nested object
      if (_.isPlainObject(v)) {
        return this.parse(v, k);
      }

      // handle simple key-value assignment
      return this.parse({[k]: {$eq: v}});
    }

    throw new CustomError(`Invalid $selection expression; object must have at least 1 property`, 'QueryParseError');
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

export default Projection;
