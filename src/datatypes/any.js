import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';

function constructAny(props = {}) {
  function nullable(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid nullable value; expected boolean, received ${type(v)}`);
    }

    props.nullable = v;
  }

  function defaults(v) {
    if (_.isFunction(v) && _.isUndefined(v.description)) {
      v.description = v.name; // name of the function
    }

    props.default = v;
  }

  function toJoi() {
    let joi = Joi.any().strict(true);

    if (!_.isUndefined(props.default)) joi = joi.default(props.default);
    if (props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  function toJSON() {
    return _.chain(props)
      .clone()
      .assign({type: 'any'})
      .value();
  }

  function isDatatype() {
    return true;
  }

  return Object.freeze({
    isDatatype,
    nullable,
    toJoi,
    toJSON,
    default: defaults, // default is reserved-word in es2015+
  });
}

export default constructAny;
