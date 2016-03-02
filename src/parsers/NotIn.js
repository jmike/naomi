import _ from 'lodash';
import type from 'type-of';
import Key from './Key';

class NotIn {

  static parse(k: string, v: Array): Array {
    if (!_.isArray(v)) {
      throw new TypeError(`Invalid $nin expression; expected array, received ${type(v)}`);
    }

    if (v.length === 0) {
      throw new TypeError(`Invalid $nin expression; array cannot be empty`);
    }

    return ['NIN', Key.parse(k), ['VALUES'].concat(v)];
  }

}

export default NotIn;
