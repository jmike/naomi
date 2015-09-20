import _ from 'lodash';
import CustomError from 'customerror';
import type from 'type-of';
import Expr from './Expr';

class And {

  static parse(v) {
    if (!_.isArray(v)) {
      throw new CustomError(`Invalid $and expression; expected array, received ${type(v)}`, 'QueryParseError');
    }

    if (v.length === 0) {
      throw new CustomError(`Invalid $and expression; array cannot be empty`, 'QueryParseError');
    }

    return ['AND'].concat(v.map((e) => Expr.parse(e)));
  }

}

export default And;
