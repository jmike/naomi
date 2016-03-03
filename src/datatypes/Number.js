import _ from 'lodash';
import Joi from 'joi';
import AnyType from './Any';

class NumberType extends AnyType {

  constructor() {
    super();
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
    if (this.props.nullable) joi = joi.optional().allow(null);
    if (this.props.default) joi = joi.default(this.props.default);

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'number'})
      .value();
  }

}

export default NumberType;
