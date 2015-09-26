import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Key from './Key';

class Nin {

  static parse(k, v) {
    if (!_.isArray(v)) {
      throw new CustomError(`Invalid $nin expression; expected array, received ${type(v)}`, 'QueryParseError');
    }

    if (v.length === 0) {
      throw new CustomError(`Invalid $nin expression; array cannot be empty`, 'QueryParseError');
    }

    return ['NIN', Key.parse(k), ['VALUES'].concat(v)];
  }

}

export default Nin;
