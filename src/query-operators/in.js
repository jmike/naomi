import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import {parse as parseKey} from './key';

/**
 * Parses the supplied key-value pair and returns an abstract syntax tree (ast).
 * @param {string} k key.
 * @param {Array} v value.
 * @return {Array}
 * @throws {QueryParseError} if method value could not be parsed.
 */
export function parse(k: string, v: Array): Array {
  if (!_.isArray(v)) {
    throw new CustomError(`Invalid $in expression; expected array, received ${type(v)}`, 'QueryParseError');
  }

  if (v.length === 0) {
    throw new CustomError(`Invalid $in expression; array cannot be empty`, 'QueryParseError');
  }

  return ['IN', parseKey(k), ['VALUES'].concat(v)];
}

/**
 * Builds and returns a parameterized query based on the supplied abstract syntax tree (ast).
 * @param {Array} ast an abstract syntax tree.
 * @return {Object}
 * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
 */
export function build(ast: Array) {
  throw new CustomError('Method not implemented', 'NotImplementedException');
}
