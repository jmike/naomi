import CustomError from 'customerror';
import QueryParser from '../QueryParser';

/**
 * Parses the supplied value and returns an abstract syntax tree (ast).
 * @param {Array} v value.
 * @return {Array}
 * @throws {QueryParseError} if method value could not be parsed.
 */
export function parse(v: Array): Array {
  if (v.length === 0) {
    throw new CustomError(`Invalid $and expression; array cannot be empty`, 'QueryParseError');
  }

  return ['AND'].concat(v.map((e) => QueryParser.parse(e)));
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
