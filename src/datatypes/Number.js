import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import Any from './Any';

class Number extends Any {

  min(v) {
    if (!_.isNumber(v)) {
      throw new TypeError(`Invalid min value; expected number, received ${type(v)}`);
    }

    this.props.min = v;
  }

  max(v) {
    if (!_.isNumber(v)) {
      throw new TypeError(`Invalid max value; expected number, received ${type(v)}`);
    }

    this.props.max = v;
  }

  positive(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid positive value; expected boolean, received ${type(v)}`);
    }

    this.props.positive = v;
  }

  negative(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid negative value; expected boolean, received ${type(v)}`);
    }

    this.props.negative = v;
  }

  toJoi() {
    let joi = Joi.number().strict(true);

    if (!_.isUndefined(this.props.default)) joi = joi.default(this.props.default);
    if (this.props.max) joi = joi.max(this.props.max);
    if (this.props.min) joi = joi.min(this.props.min);
    if (this.props.positive) joi = joi.positive();
    if (this.props.negative) joi = joi.negative();
    if (this.props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'number' })
      .value();
  }

}

export default Number;
