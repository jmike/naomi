import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import parseKey from './key';

export default function(k, v) {
  if (!_.isArray(v)) {
    throw new CustomError(`Invalid $in expression; expected array, received ${type(v)}`, 'QueryParseError');
  }

  if (v.length === 0) {
    throw new CustomError(`Invalid $in expression; array cannot be empty`, 'QueryParseError');
  }

  return ['IN', parseKey(k), ['VALUES'].concat(v)];
}
