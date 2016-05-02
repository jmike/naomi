import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import Any from './Any';

class String extends Any {

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

  regex(v) {
    if (_.isString(v)) {
      v = new RegExp(v);
    } else if (!_.isRegExp(v)) {
      throw new TypeError(`Invalid regex value; expected RegExp or string, received ${type(v)}`);
    }

    this.props.regex = v;
  }

  lowercase(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid lowercase value; expected boolean, received ${type(v)}`);
    }

    this.props.lowercase = v;
  }

  uppercase(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid uppercase value; expected boolean, received ${type(v)}`);
    }

    this.props.uppercase = v;
  }

  trim(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid trim value; expected boolean, received ${type(v)}`);
    }

    this.props.trim = v;
  }

  toJoi() {
    let joi = Joi.string().strict(true);

    if (!_.isUndefined(this.props.maxLength)) joi = joi.max(this.props.maxLength);
    if (!_.isUndefined(this.props.minLength)) joi = joi.min(this.props.minLength);
    if (!_.isUndefined(this.props.length)) joi = joi.length(this.props.length);
    if (!_.isUndefined(this.props.default)) joi = joi.default(this.props.default);
    if (this.props.regex) joi = joi.regex(this.props.regex);
    if (this.props.lowercase) joi = joi.lowercase();
    if (this.props.uppercase) joi = joi.uppercase();
    if (this.props.trim) joi = joi.trim();
    if (this.props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'string' })
      .tap((json) => {
        if (json.regex) {
          json.regex = json.regex.toString();
        }
      })
      .value();
  }

}

export default String;
