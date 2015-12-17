import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import parseKey from './key';

export default function(k: string, v: number | string | boolean | Date | Buffer): Array {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v) &&
    !_.isNull(v)
  ) {
    throw new CustomError(`Invalid $eq expression; expected number, string, boolean, date, buffer or null, received ${type(v)}`, 'QueryParseError');
  }

  return ['EQ', parseKey(k), ['VALUE', v]];
}
