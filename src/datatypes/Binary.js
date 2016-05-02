import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import Any from './Any';

class Binary extends Any {

  minLength(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid minLength value; expected integer, received ${type(v)}`);
    }

    this.props.minLength = v;
  }

  maxLength(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid maxLength value; expected integer, received ${type(v)}`);
    }

    this.props.maxLength = v;
  }

  length(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid length value; expected integer, received ${type(v)}`);
    }

    this.props.length = v;
  }

  encoding(v) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid encoding value; expected string, received ${type(v)}`);
    }

    this.props.encoding = v;
  }

  toJoi() {
    let joi = Joi.binary().strict(true);

    if (!_.isUndefined(this.props.maxLength)) joi = joi.max(this.props.maxLength);
    if (!_.isUndefined(this.props.minLength)) joi = joi.min(this.props.minLength);
    if (!_.isUndefined(this.props.length)) joi = joi.length(this.props.length);
    if (!_.isUndefined(this.props.encoding)) joi = joi.encoding(this.props.encoding);
    if (!_.isUndefined(this.props.default)) joi = joi.default(this.props.default);
    if (this.props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'binary' })
      .value();
  }

}

export default Binary;
