import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Key from './Key';

class In {

  static parse(k, v) {
    if (!_.isArray(v)) {
      throw new CustomError(`Invalid $in expression; expected array, received ${type(v)}`, 'QueryParseError');
    }

    if (v.length === 0) {
      throw new CustomError(`Invalid $in expression; array cannot be empty`, 'QueryParseError');
    }

    return ['IN', Key.parse(k), ['VALUES'].concat(v)];
  }

}

export default In;
