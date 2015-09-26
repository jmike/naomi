import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Key from './Key';

class Lte {

  static parse(k, v) {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v)
    ) {
      throw new CustomError(`Invalid $lte expression; expected number, string, boolean, date or buffer, received ${type(v)}`, 'QueryParseError');
    }

    return ['LTE', Key.parse(k), ['VALUE', v]];
  }

}

export default Lte;
