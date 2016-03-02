import _ from 'lodash';
import parseKey from './key';

/**
 * Parses the given orderby expression and returns an abstract syntax tree (ast).
 * @param {string, Object, Array<string, Object>} [expression] optional orderby expression.
 * @return {Array}
 */
function parse(expression: ?string | Object | Array<string | Object>): Array {
  if (_.isNull(expression) || _.isUndefined(expression)) {
    return ['ORDERBY', null];
  }

  if (_.isString(expression) || _.isPlainObject(expression)) {
    expression = [expression];
  }

  const arr = expression.map((e, i) => {
    if (_.isString(e)) {
      return ['ASC', parseKey(e)];
    }

    const keys = Object.keys(e);

    if (keys.length === 0) {
      throw new TypeError(`Invalid orderby expression; object at position ${i} cannot be empty`);
    }

    if (keys.length > 1) {
      throw new TypeError(`Invalid orderby expression; object at position ${i} must contain exactly one property`);
    }

    const k = keys[0];
    const v = e[k];

    if (v !== 1 && v !== -1) {
      throw new TypeError(`Invalid orderby expression; object at position ${i} must have a value of -1 or 1`);
    }

    return [v === 1 ? 'ASC' : 'DESC', parseKey(k)];
  });

  return ['ORDERBY'].concat(arr);
}

export default parse;
