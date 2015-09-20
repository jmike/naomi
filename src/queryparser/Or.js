import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Expr from './Expr';

class Or {

  static parse(v) {
    if (!_.isArray(v)) {
      throw new CustomError(`Invalid $or expression; expected array, received ${type(v)}`, 'QueryParseError');
    }

    if (v.length === 0) {
      throw new CustomError(`Invalid $or expression; array cannot be empty`, 'QueryParseError');
    }

    return ['OR'].concat(v.map((e) => Expr.parse(e)));
  }

}

export default Or;
