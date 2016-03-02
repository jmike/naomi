import _ from 'lodash';
import type from 'type-of';
import Key from './Key';

class NotLike {

  static parse(k: string, v: string) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid $nlike expression; expected string, received ${type(v)}`);
    }

    return ['NLIKE', Key.parse(k), ['VALUE', v]];
  }

}

export default NotLike;
