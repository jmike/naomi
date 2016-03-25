import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import any from './any';

function constructNumber(props = {}) {
  let nullable;
  let defaults;
  let isDatatype;

  ({nullable, isDatatype, 'default': defaults} = any(props));

  function min(v) {
    if (!_.isNumber(v)) {
      throw new TypeError(`Invalid min value; expected number, received ${type(v)}`);
    }

    props.min = v;
  }

  function max(v) {
    if (!_.isNumber(v)) {
      throw new TypeError(`Invalid max value; expected number, received ${type(v)}`);
    }

    props.max = v;
  }

  function positive(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid positive value; expected boolean, received ${type(v)}`);
    }

    props.positive = v;
  }

  function negative(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid negative value; expected boolean, received ${type(v)}`);
    }

    props.negative = v;
  }

  function toJoi() {
    let joi = Joi.number().strict(true);

    if (!_.isUndefined(props.default)) joi = joi.default(props.default);
    if (props.max) joi = joi.max(props.max);
    if (props.min) joi = joi.min(props.min);
    if (props.positive) joi = joi.positive();
    if (props.negative) joi = joi.negative();
    if (props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  function toJSON() {
    return _.chain(props)
      .clone()
      .assign({type: 'number'})
      .value();
  }

  return Object.freeze({
    nullable,
    isDatatype,
    min,
    max,
    positive,
    negative,
    toJoi,
    toJSON,
    default: defaults, // default is reserved-word in es2015+
  });
}

export default constructNumber;
