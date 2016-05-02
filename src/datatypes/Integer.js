import _ from 'lodash';
import type from 'type-of';
import Number from './Number';

class Integer extends Number {

  autoinc(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid autoinc value; expected boolean, received ${type(v)}`);
    }

    this.props.autoinc = v;
  }

  toJoi() {
    let joi = super.toJoi();

    joi = joi.integer();

    return joi;
  }

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'integer' })
      .value();
  }

}

export default Integer;
