import _ from 'lodash';
import type from 'type-of';
import Key from './Key';

class Like {

  static parse(k: string, v: string) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid $like expression; expected string, received ${type(v)}`);
    }

    return ['LIKE', Key.parse(k), ['VALUE', v]];
  }

}

export default Like;
