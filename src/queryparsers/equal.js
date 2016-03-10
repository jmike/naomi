import _ from 'lodash';
import type from 'type-of';
import parseKey from './key';

function parse(k: string, v: number | string | boolean | Date | ?Buffer): Array {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v) &&
    !_.isNull(v)
  ) {
    throw new TypeError(`Invalid $eq expression; expected number, string, boolean, date, buffer or null, received ${type(v)}`);
  }

  return ['EQ', parseKey(k), ['VALUE', v]];
}

export default parse;
