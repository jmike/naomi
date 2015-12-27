import _ from 'lodash';
import Joi from 'joi';

class DateType {

  constructor() {
    this.props = {};
  }

  set min(v: Date): void {
    this.props.min = v;
  }

  get min(): Date {
    return this.props.min;
  }

  set max(v: Date): void {
    this.props.max = v;
  }

  get max(): Date {
    return this.props.max;
  }

  set format(v: string): void {
    this.props.format = v;
  }

  get format(): string {
    return this.props.format;
  }

  toJoi(): Joi {
    const joi = Joi.date().strict(true);

    if (this.props.max) joi.max(this.props.max);
    if (this.props.min) joi.min(this.props.min);
    if (this.props.format) joi.format(this.props.format);

    return joi;
  }

  toJSON(): Object {
    const json = _.clone(this.props);

    json.type = 'date';

    return json;
  }

}

export default DateType;
