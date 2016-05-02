import _ from 'lodash';
import type from 'type-of';
import Number from './Number';

/**
 * Calculates the max absolute value for the given precision and scale.
 * @param {number} precision the number of total digits in value, including decimals.
 * @param {number} [scale] the numver of decimal digits in value.
 * @return {number}
 * @private
 */
function calculateMaxValue(precision, scale) {
  const arr = _.fill(Array(precision), '9');

  if (scale) {
    arr.splice(precision - scale, 0, '.');
  }

  return parseFloat(arr.join(''));
}

class Float extends Number {

  precision(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid precision value; expected integer, received ${type(v)}`);
    }

    this.props.precision = v;
  }

  scale(v) {
    if (!_.isInteger(v)) {
      throw new TypeError(`Invalid scale value; expected integer, received ${type(v)}`);
    }

    this.props.scale = v;
  }

  toJoi() {
    if (!_.isUndefined(this.props.precision)) {
      const maxValue = calculateMaxValue(this.props.precision, this.props.scale);

      if (_.isUndefined(this.props.max) || this.props.max > maxValue) {
        this.props.max = maxValue;
      }

      if (_.isUndefined(this.props.min) || this.props.min < -maxValue) {
        this.props.min = -maxValue;
      }
    }

    let joi = super.toJoi();

    if (this.props.scale) {
      joi = joi.precision(this.props.scale);
    }

    return joi;
  }

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'float' })
      .value();
  }

}

export default Float;
