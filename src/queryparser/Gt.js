import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Key from './Key';

class Gt {

  static parse(k, v) {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v)
    ) {
      throw new CustomError(`Invalid $gt expression; expected number, string, boolean, date or buffer, received ${type(v)}`, 'QueryParseError');
    }

    return ['GT', Key.parse(k), ['VALUE', v]];
  }

}

export default Gt;
