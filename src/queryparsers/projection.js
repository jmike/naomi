import _ from 'lodash';
import type from 'type-of';
import parseKey from './key';

function parse(projection) {
  // handle null or undefined projection
  if (_.isNil(projection)) {
    projection = {};
  }

  // make sure projection is plain object
  if (!_.isPlainObject(projection)) {
    throw new TypeError(`Invalid projection projection; expected plain object, received ${type(projection)}`);
  }

  // handle empty projection object
  if (_.isEmpty(projection)) {
    return ['PROJECTION', null]; // null signifies "*" (i.e. "all columns")
  }

  // populate incl, excl arrays
  const incl = [];
  const excl = [];

  Object.keys(projection).forEach((k) => {
    if (projection[k] === 1) {
      incl.push(parseKey(k));
    } else if (projection[k] === -1) {
      excl.push(parseKey(k));
    } else {
      throw new TypeError(`Invalid "projection" argument; expected "${k}" to have a value of -1 or 1`);
    }
  });

  // include always has precedence over exclusion
  if (incl.length !== 0) {
    return ['PROJECTION'].concat(incl);
  }

  return ['NPROJECTION'].concat(excl);
}

export default parse;
