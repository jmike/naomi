import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Key from './Key';

class Like {

  static parse(k, v) {
    if (!_.isString(v)) {
      throw new CustomError(`Invalid $like expression; expected string, received ${type(v)}`, 'QueryParseError');
    }

    return ['LIKE', Key.parse(k), ['VALUE', v]];
  }

}

export default Like;
