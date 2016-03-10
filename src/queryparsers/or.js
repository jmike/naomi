import _ from 'lodash';
import type from 'type-of';
import parseSelection from './selection';

function parse(v: Array): Array {
  if (!_.isArray(v)) {
    throw new TypeError(`Invalid or expression; expected array, received ${type(v)}`);
  }

  if (v.length === 0) {
    throw new TypeError(`Invalid or expression; array cannot be empty`);
  }

  return ['OR'].concat(v.map((e) => {
    const selection = parseSelection(e);
    return selection[1]; // remove the "SELECTION" part
  }));
}

export default parse;
