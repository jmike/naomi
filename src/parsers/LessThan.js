import _ from 'lodash';
import type from 'type-of';
import Key from './Key';

class LessThan {

  static parse(k: string, v: number | string | boolean | Date | Buffer): Array {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v)
    ) {
      throw new TypeError(`Invalid $lt expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
    }

    return ['LT', Key.parse(k), ['VALUE', v]];
  }

}

export default LessThan;
