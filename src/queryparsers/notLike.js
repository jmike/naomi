import _ from 'lodash';
import type from 'type-of';
import parseKey from './key';

function parse(k: string, v: string) {
  if (!_.isString(v)) {
    throw new TypeError(`Invalid $nlike expression; expected string, received ${type(v)}`);
  }

  return ['NLIKE', parseKey(k), ['VALUE', v]];
}

export default parse;
