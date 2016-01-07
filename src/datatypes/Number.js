import _ from 'lodash';
import Joi from 'joi';

class NumberType {

  constructor() {
    this.props = {};
  }

  min(v: number): NumberType {
    this.props.min = v;
    return this;
  }

  max(v: number): NumberType {
    this.props.max = v;
    return this;
  }

  positive(v: boolean): NumberType {
    this.props.positive = v;
    return this;
  }

  negative(v: boolean): NumberType {
    this.props.negative = v;
    return this;
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
