import _ from 'lodash';
import type from 'type-of';
import parseKey from './key';

function parse(k: string, v: string) {
  if (!_.isString(v)) {
    throw new TypeError(`Invalid $like expression; expected string, received ${type(v)}`);
  }

  return ['LIKE', parseKey(k), ['VALUE', v]];
}

export default parse;
