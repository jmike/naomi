import _ from 'lodash';
import Joi from 'joi';
import any from './any';

function constructUUID(props = {}) {
  let nullable;
  let defaults;
  let isDatatype;

  ({nullable, isDatatype, 'default': defaults} = any(props));

  function toJoi() {
    let joi = Joi.string().guid().strict(true);

    if (!_.isUndefined(props.default)) joi = joi.default(props.default);
    if (props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  function toJSON() {
    return _.chain(props)
      .clone()
      .assign({ type: 'uuid' })
      .value();
  }

  return Object.freeze({
    isDatatype,
    nullable,
    toJoi,
    toJSON,
    default: defaults, // default is reserved-word in es2015+
  });
}

export default constructUUID;
