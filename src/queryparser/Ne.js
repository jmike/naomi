import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Key from './Key';

class Ne {

  static parse(k, v) {
    if (
      !_.isNumber(v) &&
      !_.isString(v) &&
      !_.isBoolean(v) &&
      !_.isDate(v) &&
      !Buffer.isBuffer(v) &&
      !_.isNull(v)
    ) {
      throw new CustomError(`Invalid $ne expression; expected number, string, boolean, date or buffer, received ${type(v)}`, 'QueryParseError');
    }

    return ['NE', Key.parse(k), ['VALUE', v]];
  }

}

export default Ne;
