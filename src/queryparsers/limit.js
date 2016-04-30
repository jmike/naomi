import _ from 'lodash';
import type from 'type-of';

function parse(limit) {
  // check if limit is null or undefined
  if (_.isNil(limit)) {
    return ['LIMIT', null];
  }

  // make sure limit is integer
  if (!_.isInteger(limit)) {
    throw new TypeError(`Invalid "limit" argument; expected positive integer, received ${type(limit)}`);
  }

  // make sure limit is positive
  if (limit < 1) {
    throw new TypeError('Invalid "limit" argument; value must be >= 1');
  }

  return ['LIMIT', limit];
}

export default parse;
