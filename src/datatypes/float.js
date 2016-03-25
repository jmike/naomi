import _ from 'lodash';
import type from 'type-of';
import number from './number';

/**
 * Calculates the max absolute value for the given precision and scale.
 * @param {number} precision the number of total digits in value, including decimals.
 * @param {number} [scale] the numver of decimal digits in value.
 * @return {number}
 * @private
 */
function calculateMaxValue(precision: number, scale: ?number): number {
  const arr = _.fill(Array(precision), '9');

  if (scale) {
    arr.splice(precision - scale, 0, '.');
  }

  return parseFloat(arr.join(''));
}

function constructFloat(props = {}) {
  let nullable;
  let defaults;
  let isDatatype;
  let max;
  let min;
  let negative;
  let positive;
  let toJoi;

  ({nullable, max, min, negative, positive, isDatatype, toJoi, 'default': defaults} = number(props));

  function precision(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid precision value; expected integer, received ${type(v)}`);
    }

    props.precision = v;
  }

  function scale(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid scale value; expected integer, received ${type(v)}`);
    }

    props.scale = v;
  }

  function setBoundaries() {
    if (!_.isUndefined(props.precision)) {
      const maxValue = calculateMaxValue(props.precision, props.scale);

      if (_.isUndefined(props.max) || props.max > maxValue) {
        props.max = maxValue;
      }

      if (_.isUndefined(props.min) || props.min < -maxValue) {
        props.min = -maxValue;
      }
    }
  }

  function extendJoi(joi) {
    if (props.scale) {
      joi = joi.precision(props.scale);
    }

    return joi;
  }

  function toJSON() {
    return _.chain(props)
      .clone()
      .assign({type: 'float'})
      .value();
  }

  return Object.freeze({
    nullable,
    isDatatype,
    max,
    min,
    positive,
    negative,
    precision,
    scale,
    toJSON,
    toJoi: _.flow(setBoundaries, toJoi, extendJoi),
    default: defaults, // default is reserved-word in es2015+
  });
}

export default constructFloat;
