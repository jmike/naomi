import _ from 'lodash';
import Joi from 'joi';

class DateType {

  constructor() {
    this.props = {};
  }

  min(v: Date): DateType {
    this.props.min = v;
    return this;
  }

  max(v: Date): DateType {
    this.props.max = v;
    return this;
  }

  format(v: string): DateType {
    this.props.format = v;
    return this;
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
