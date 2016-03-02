import _ from 'lodash';

/**
 * Parses the supplied offset and returns an abstract syntax tree (ast).
 * @param {number} [offset] a non-negative integer.
 * @return {Array}
 */
function parse(offset: ?number): Array {
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

export default parse;
