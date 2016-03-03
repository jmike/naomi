import _ from 'lodash';
import Joi from 'joi';
import IntegerType from './Integer';

/**
 * Calculate the max absolute value for the given precision and scale.
 * @param {number} precision the number of total digits in value, including decimals.
 * @param {number} [scale] the numver of decimal digits in value.
 * @return {number}
 * @private
 */
function calculateMaxValue(precision: number, scale: ?number): number {
  const arr = _.fill(Array(precision), '9');

  if (scale) {
    arr.splice(precision - scale, '.');
  }

  return parseFloat(arr.join(''));
}

class FloatType extends IntegerType {

  constructor() {
    super();
  }

  set precision(v: number): void {
    this.props.precision = v;
  }

  set scale(v: number): void {
    this.props.scale = v;
  }

  toJoi(): Object {
    // reset max + min values based on precision + scale
    if (!_.isUndefined(this.props.precision)) {
      const maxValue = calculateMaxValue(this.props.precision, this.props.scale);

      if (_.isUndefined(this.props.max) || this.props.max > maxValue) {
        this.props.max = maxValue;
      }

      if (_.isUndefined(this.props.min) || this.props.min < -maxValue) {
        this.props.min = -maxValue;
      }
    }

    let joi = Joi.number().strict(true);

    if (this.props.max) joi = joi.max(this.props.max);
    if (this.props.min) joi = joi.min(this.props.min);
    if (this.props.positive) joi = joi.positive();
    if (this.props.negative) joi = joi.negative();
    if (this.props.scale) joi = joi.precision(this.props.scale);

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'float'})
      .value();
  }

}

export default FloatType;
