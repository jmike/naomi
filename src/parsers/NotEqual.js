import _ from 'lodash';
import type from 'type-of';
import Key from './Key';

class NotEqual {

  static parse(k: string, v: number | string | boolean | Date | ?Buffer): Array {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v) &&
      !_.isNull(v)
    ) {
      throw new TypeError(`Invalid $ne expression; expected number, string, boolean, date or buffer, received ${type(v)}`);
    }

    return ['NE', Key.parse(k), ['VALUE', v]];
  }

}

export default NotEqual;
