import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Key from './Key';

class Eq {

  static parse(k, v) {
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

    return ['EQ', Key.parse(k), ['VALUE', v]];
  }

}

export default Eq;
