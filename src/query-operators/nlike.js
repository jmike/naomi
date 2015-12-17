import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import parseKey from './key';

export default function(k, v) {
  if (!_.isString(v)) {
    throw new CustomError(`Invalid $nlike expression; expected string, received ${type(v)}`, 'QueryParseError');
  }

  return ['NLIKE', parseKey(k), ['VALUE', v]];
}
