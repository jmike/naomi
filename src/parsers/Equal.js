import _ from 'lodash';
import type from 'type-of';
import Key from './Key';

class Equal {

  static parse(k: string, v: number | string | boolean | Date | ?Buffer): Array {
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

    return ['EQ', Key.parse(k), ['VALUE', v]];
  }

}

export default Equal;
