import _ from 'lodash';
import Joi from 'joi';
import AnyType from './Any';

class DateType extends AnyType {

  constructor() {
    super();
  }

  set min(v: string): void {
    this.props.min = v;
  }

  set max(v: string): void {
    this.props.max = v;
  }

  set format(v: string): void {
    this.props.format = v;
  }

  toJoi(): Object {
    let joi = Joi.date().strict(false); // mark strict as false to accept date strings

    if (!_.isUndefined(this.props.default)) joi = joi.default(this.props.default);
    if (this.props.max) joi = joi.max(this.props.max);
    if (this.props.min) joi = joi.min(this.props.min);
    if (this.props.format) joi = joi.format(this.props.format);
    if (this.props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'date'})
      .value();
  }

}

export default DateType;
