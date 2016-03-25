import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import string from './string';

function constructBinary(props = {}) {
  let nullable;
  let defaults;
  let isDatatype;
  let maxLength;
  let minLength;
  let length;

  ({nullable, minLength, maxLength, length, isDatatype, 'default': defaults} = string(props));

  function encoding(v) {
    if (!_.isString(v)) {
      throw new TypeError(`Invalid encoding value; expected string, received ${type(v)}`);
    }

    props.encoding = v;
  }

  function toJoi() {
    let joi = Joi.binary().strict(true);

    if (!_.isUndefined(props.maxLength)) joi = joi.max(props.maxLength);
    if (!_.isUndefined(props.minLength)) joi = joi.min(props.minLength);
    if (!_.isUndefined(props.length)) joi = joi.length(props.length);
    if (!_.isUndefined(props.encoding)) joi = joi.encoding(props.encoding);
    if (!_.isUndefined(props.default)) joi = joi.default(props.default);
    if (props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  function toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({type: 'binary'})
      .value();
  }

  return Object.freeze({
    nullable,
    isDatatype,
    length,
    minLength,
    maxLength,
    encoding,
    toJoi,
    toJSON,
    default: defaults, // default is reserved-word in es2015+
  });
}

export default constructBinary;
