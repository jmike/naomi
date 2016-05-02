import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';

class Any {

  constructor() {
    this.props = {};
  }

  nullable(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid nullable value; expected boolean, received ${type(v)}`);
    }

    this.props.nullable = v;
  }

  default(v) {
    if (_.isFunction(v) && _.isUndefined(v.description)) {
      v.description = v.name; // name of the function
    }

    this.props.default = v;
  }

  toJoi() {
    let joi = Joi.any().strict(true);

    if (!_.isUndefined(this.props.default)) joi = joi.default(this.props.default);
    if (this.props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'any' })
      .value();
  }
}

export default Any;
