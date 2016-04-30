import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import any from './any';

function constructDate(props = {}) {
  let nullable;
  let defaults;
  let isDatatype;

  ({nullable, isDatatype, 'default': defaults} = any(props));

  function min(v) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid min value; expected string, received ${type(v)}`);
    }

    props.min = v;
  }

  function max(v) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid max value; expected string, received ${type(v)}`);
    }

    props.max = v;
  }

  function format(v) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid format value; expected string, received ${type(v)}`);
    }

    props.format = v;
  }

  function toJoi() {
    let joi = Joi.date().strict(false); // mark strict as false to accept date strings

    if (!_.isUndefined(props.default)) joi = joi.default(props.default);
    if (props.max) joi = joi.max(props.max);
    if (props.min) joi = joi.min(props.min);
    if (props.format) joi = joi.format(props.format);
    if (props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  function toJSON() {
    return _.chain(props)
      .clone()
      .assign({ type: 'date' })
      .value();
  }

  return Object.freeze({
    nullable,
    isDatatype,
    max,
    min,
    format,
    toJoi,
    toJSON,
    default: defaults, // default is reserved-word in es2015+
  });
}

export default constructDate;
