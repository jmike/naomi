import _ from 'lodash';
import type from 'type-of';
import number from './number';

function constructInteger(props = {}) {
  let nullable;
  let defaults;
  let isDatatype;
  let max;
  let min;
  let negative;
  let positive;
  let toJoi;

  ({nullable, max, min, negative, positive, isDatatype, toJoi, 'default': defaults} = number(props));

  function autoinc(v) {
    if (!_.isBoolean(v)) {
      throw new TypeError(`Invalid autoinc value; expected boolean, received ${type(v)}`);
    }

    props.autoinc = v;
  }

  function extendJoi(joi) {
    return joi.strict(true).integer();
  }

  function toJSON() {
    return _.chain(props)
      .clone()
      .assign({ type: 'integer' })
      .value();
  }

  return Object.freeze({
    nullable,
    isDatatype,
    max,
    min,
    positive,
    negative,
    autoinc,
    toJSON,
    toJoi: _.flow(toJoi, extendJoi),
    default: defaults, // default is reserved-word in es2015+
  });
}

export default constructInteger;
