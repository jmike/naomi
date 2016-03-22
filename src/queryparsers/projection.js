import _ from 'lodash';
import type from 'type-of';
import parseKey from './key';

/**
 * Parses the given projection expression and returns an abstract syntax tree (ast).
 * @param {Object} [expression] optional expression value, e.g. {'foo': 1, 'bar': 1} or {'foo': -1}.
 * @return {Array}
 */
function parse(expression) {
  if (_.isNull(expression) || _.isUndefined(expression)) {
    expression = {};
  } else if (!_.isPlainObject(expression)) {
    throw new TypeError(`Invalid projection expression; expected plain object, received ${type(expression)}`);
  }

  if (_.isEmpty(expression)) {
    return ['PROJECTION', null]; // null signifies "*" (i.e. "all columns")
  }

  const incl = [];
  const excl = [];

  Object.keys(expression).forEach((k) => {
    if (expression[k] === 1) {
      incl.push(parseKey(k));
    } else if (expression[k] === 0 || expression[k] === -1) {
      excl.push(parseKey(k));
    } else {
      throw new TypeError(`Invalid projection expression for key "${k}"; expected -1 or 1`);
    }
  });

  if (incl.length !== 0) { // include always has precedence
    return ['PROJECTION'].concat(incl);
  }

  if (excl.length !== 0) {
    return ['NPROJECTION'].concat(excl);
  }
}

export default parse;
