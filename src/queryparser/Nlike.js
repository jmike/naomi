import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Key from './Key';

class Nlike {

  static parse(k, v) {
    if (!_.isString(v)) {
      throw new CustomError(`Invalid $nlike expression; expected string, received ${type(v)}`, 'QueryParseError');
    }

    return ['NLIKE', Key.parse(k), ['VALUE', v]];
  }

}

export default Nlike;
