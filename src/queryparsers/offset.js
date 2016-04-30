import _ from 'lodash';
import type from 'type-of';

function parse(offset) {
  // check if offset is null or undefined
  if (_.isNil(offset)) {
    return ['OFFSET', null];
  }

  // make sure value is non-negative integer
  if (!_.isInteger(offset)) {
    throw new TypeError(`Invalid "offset" argument; expected non-negative integer, received ${type(offset)}`);
  }

  if (offset < 0) {
    throw new TypeError('Invalid "offset" argument; value must be >= 0');
  }

  return ['OFFSET', offset];
}

export default parse;
