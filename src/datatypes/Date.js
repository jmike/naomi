import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import Any from './Any';

class Date extends Any {

  min(v) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid min value; expected string, received ${type(v)}`);
    }

    this.props.min = v;
  }

  max(v) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid max value; expected string, received ${type(v)}`);
    }

    this.props.max = v;
  }

  format(v) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid format value; expected string, received ${type(v)}`);
    }

    this.props.format = v;
  }

  toJoi() {
    let joi = Joi.date().strict(false); // mark strict as false to accept date strings

    if (!_.isUndefined(this.props.default)) joi = joi.default(this.props.default);
    if (this.props.max) joi = joi.max(this.props.max);
    if (this.props.min) joi = joi.min(this.props.min);
    if (this.props.format) joi = joi.format(_.uniq([this.props.format, 'x'])); // add "x" for millis timestamp
    if (this.props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'date' })
      .value();
  }

}

export default Date;
