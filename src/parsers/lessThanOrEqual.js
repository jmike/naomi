import _ from 'lodash';
import type from 'type-of';
import parseKey from './key';

function parse(k: string, v: number | string | boolean | Date | Buffer): Array {
  if (
    !_.isNumber(v) &&
    !_.isString(v) &&
    !_.isBoolean(v) &&
    !_.isDate(v) &&
    !Buffer.isBuffer(v)
  ) {
    throw new TypeError(`Invalid $lte expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
  }

  return ['LTE', parseKey(k), ['VALUE', v]];
}

export default parse;
