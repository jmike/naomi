const _ = require('lodash');
const type = require('type-of');
const CustomError = require('customerror');

class QueryParser {

  constructor() {
    this._comparison = new Map();
    this._logical = new Map();
  }

  /**
   * Registers the given logical operator under the designated identifier.
   * @param {String} id logical operator identifier.
   * @param {Function} parser
   * @throws {InvalidArgument} if params are invalid or unspecified.
   */
  registerLogicalOperator(id, parser) {
    // validate params
    if (!_.isString(id)) {
      throw new CustomError(`Invalid id argument; expected string, received ${type(id)}`, 'InvalidArgument');
    }

    if (!_.isFunction(parser)) {
      throw new CustomError(`Invalid parser argument; expected function, received ${type(parser)}`, 'InvalidArgument');
    }

    this._logical.set(id, parser);
  }

  /**
   * Registers the given comparison operator under the designated identifier.
   * @param {String} id comparison operator identifier.
   * @param {Function} parser
   * @throws {InvalidArgument} if params are invalid or unspecified.
   */
  registerComparisonOperator(id, parser) {
    // validate params
    if (!_.isString(id)) {
      throw new CustomError(`Invalid id argument; expected string, received ${type(id)}`, 'InvalidArgument');
    }

    if (!_.isFunction(parser)) {
      throw new CustomError(`Invalid parser argument; expected function, received ${type(parser)}`, 'InvalidArgument');
    }

    this._comparison.set(id, parser);
  }

  /**
   * Parses and returns an AST (Abstract Syntax Tree) representation of the given expression.
   * @param {Number, String, Date, Buffer, Boolean, Array, Object} $expr
   * @throws {QueryParseError} if params are invalid or unspecified
   * @return {Array}
   */
  parse($expr, _mem) {
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

module.exports = new QueryParser(); // singleton
