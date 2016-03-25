import _ from 'lodash';
import Joi from 'joi';
import string from './string';

function constructEmail(props = {}) {
  let nullable;
  let defaults;
  let isDatatype;
  let maxLength;
  let minLength;
  let length;
  let lowercase;
  let uppercase;
  let trim;

  ({nullable, minLength, maxLength, length, lowercase, uppercase, trim, isDatatype, 'default': defaults} = string(props));

  function toJoi() {
    let joi = Joi.string().email().strict(true);

    if (!_.isUndefined(props.maxLength)) joi = joi.max(props.maxLength);
    if (!_.isUndefined(props.minLength)) joi = joi.min(props.minLength);
    if (!_.isUndefined(props.length)) joi = joi.length(props.length);
    if (!_.isUndefined(props.default)) joi = joi.default(props.default);
    if (props.lowercase) joi = joi.lowercase();
    if (props.uppercase) joi = joi.uppercase();
    if (props.trim) joi = joi.trim();
    if (props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  function toJSON() {
    return _.chain(props)
      .clone()
      .assign({type: 'email'})
      .value();
  }

  return Object.freeze({
    nullable,
    isDatatype,
    length,
    minLength,
    maxLength,
    lowercase,
    uppercase,
    trim,
    toJoi,
    toJSON,
    default: defaults
  });
}

export default constructEmail;
