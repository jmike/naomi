import _ from 'lodash';
import Joi from 'joi';

class NumberType {

  constructor() {
    this.props = {};
  }

  set min(v: number): void {
    this.props.min = v;
  }

  get min(): number {
    return this.props.min;
  }

  set max(v: number): void {
    this.props.max = v;
  }

  get max(): number {
    return this.props.max;
  }

  set positive(v: boolean): void {
    this.props.positive = v;
  }

  get positive(): boolean {
    return this.props.positive;
  }

  set negative(v: boolean): void {
    this.props.negative = v;
  }

  get negative(): boolean {
    return this.props.negative;
  }

  toJoi(): Joi {
    const joi = Joi.number().strict(true);

    if (this.props.max) joi.max(this.props.max);
    if (this.props.min) joi.min(this.props.min);
    if (this.props.positive) joi.positive();
    if (this.props.negative) joi.negative();

    return joi;
  }

  toJSON(): Object {
    const json = _.clone(this.props);

    json.type = 'number';

    return json;
  }

}

export default NumberType;
