import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import any from './any';

function constructEnum(props = {}) {
  let nullable;
  let defaults;
  let isDatatype;

  ({nullable, isDatatype, 'default': defaults} = any(props));

  function values(...args) {
    if (args.length === 0) {
      throw new Error(`You must specify at least on values argument`);
    }

    if (args.length === 1 && _.isArray(args[0])) {
      return values.apply(null, args[0]);
    }

    args.forEach((e) => {
      if (!_.isString(e)) {
        throw new TypeError(`Invalid values argument; expected string, received ${type(e)}`);
      }
    });

    props.values = args;
  }

  function toJoi() {
    let joi = Joi.string().strict(true);

    if (!_.isUndefined(props.default)) joi = joi.default(props.default);
    if (props.values) joi = joi.valid(props.values);
    if (props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  function toJSON() {
    return _.chain(props)
      .clone()
      .assign({type: 'enum'})
      .value();
  }

  return Object.freeze({
    nullable,
    isDatatype,
    values,
    toJoi,
    toJSON,
    default: defaults, // default is reserved-word in es2015+
  });
}

export default constructEnum;
