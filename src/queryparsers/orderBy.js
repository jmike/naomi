import _ from 'lodash';
import parseKey from './key';

function parse(orderby) {
  if (_.isNull(orderby) || _.isUndefined(orderby)) {
    return ['ORDERBY', null];
  }

  if (_.isString(orderby) || _.isPlainObject(orderby)) {
    orderby = [orderby];
  }

  const arr = orderby.map((e, i) => {
    if (_.isString(e)) {
      return ['ASC', parseKey(e)];
    }

    const keys = Object.keys(e);

    if (keys.length === 0) {
      throw new TypeError(`Invalid "orderby" argument; object at position ${i} cannot be empty`);
    }

    if (keys.length > 1) {
      throw new TypeError(`Invalid "orderby" argument; object at position ${i} must contain exactly one property`);
    }

    const k = keys[0];
    const v = e[k];

    if (v !== 1 && v !== -1) {
      throw new TypeError(`Invalid "orderby" argument; object at position ${i} must have a value of -1 or 1`);
    }

    return [v === 1 ? 'ASC' : 'DESC', parseKey(k)];
  });

  return ['ORDERBY'].concat(arr);
}

export default parse;
