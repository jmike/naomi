import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Key from './Key';

class Lt {

  static parse(k, v) {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v)
    ) {
      throw new CustomError(`Invalid $lt expression; expected number, string, boolean, date or buffer, received ${type(v)}`, 'QueryParseError');
    }

    return ['LT', Key.parse(k), ['VALUE', v]];
  }

}

export default Lt;
