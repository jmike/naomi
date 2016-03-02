import _ from 'lodash';
import type from 'type-of';
import parseKey from './key';

function parse(k: string, v: Array): Array {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid $nin expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid $nin expression; array cannot be empty`);
  }

  return ['NIN', parseKey(k), ['VALUES'].concat(v)];
}

export default parse;
