import _ from 'lodash';
import Joi from 'joi';

class NumberType {

  constructor() {
    this.props = {};
  }

  set min(v: number): void {
    this.props.min = v;
  }

  set max(v: number): void {
    this.props.max = v;
  }

  set positive(v: boolean): void {
    this.props.positive = v;
  }

  set negative(v: boolean): void {
    this.props.negative = v;
  }

  toJoi(): Object {
    let joi = Joi.number().strict(true);

    if (this.props.max) joi = joi.max(this.props.max);
    if (this.props.min) joi = joi.min(this.props.min);
    if (this.props.positive) joi = joi.positive();
    if (this.props.negative) joi = joi.negative();

    return joi;
  }

  toJSON(): Object {
    const json = _.clone(this.props);

    json.type = 'number';

    return json;
  }

}

export default NumberType;
