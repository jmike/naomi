import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import any from './any';

function constructString(props = {}) {
  let nullable;
  let defaults;
  let isDatatype;

  ({nullable, isDatatype, 'default': defaults} = any(props));

  function minLength(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid minLength value; expected integer, received ${type(v)}`);
    }

    props.minLength = v;
  }

  function maxLength(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid maxLength value; expected integer, received ${type(v)}`);
    }

    props.maxLength = v;
  }

  function length(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid length value; expected integer, received ${type(v)}`);
    }

    props.length = v;
  }

  function regex(v) {
    if (_.isString(v)) {
      v = new RegExp(v);
    } else if (!_.isRegExp(v)) {
      throw new TypeError(`Invalid regex value; expected RegExp or string, received ${type(v)}`);
    }

    props.regex = v;
  }

  function lowercase(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid lowercase value; expected boolean, received ${type(v)}`);
    }

    props.lowercase = v;
  }

  function uppercase(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid uppercase value; expected boolean, received ${type(v)}`);
    }

    props.uppercase = v;
  }

  function trim(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid trim value; expected boolean, received ${type(v)}`);
    }

    props.trim = v;
  }

  function toJoi() {
    let joi = Joi.string().strict(true);

    if (!_.isUndefined(props.maxLength)) joi = joi.max(props.maxLength);
    if (!_.isUndefined(props.minLength)) joi = joi.min(props.minLength);
    if (!_.isUndefined(props.length)) joi = joi.length(props.length);
    if (!_.isUndefined(props.default)) joi = joi.default(props.default);
    if (props.regex) joi = joi.regex(props.regex);
    if (props.lowercase) joi = joi.lowercase();
    if (props.uppercase) joi = joi.uppercase();
    if (props.trim) joi = joi.trim();
    if (props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  function toJSON() {
    return _.chain(props)
      .clone()
      .assign({ type: 'string' })
      .tap((json) => {
        if (json.regex) {
          json.regex = json.regex.toString();
        }
      })
      .value();
  }

  return Object.freeze({
    nullable,
    isDatatype,
    length,
    minLength,
    maxLength,
    trim,
    lowercase,
    uppercase,
    regex,
    toJoi,
    toJSON,
    default: defaults, // default is reserved-word in es2015+
  });
}

export default constructString;
