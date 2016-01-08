import _ from 'lodash';
import Joi from 'joi';

class DateType {

  constructor() {
    this.props = {};
  }

  set min(v: Date): void {
    this.props.min = v;
  }

  set max(v: Date): void {
    this.props.max = v;
  }

  set format(v: string): void {
    this.props.format = v;
  }

  toJoi(): Object {
    let joi = Joi.date().strict(false); // mark strict as false to accept date strings

    if (this.props.max) joi = joi.max(this.props.max);
    if (this.props.min) joi = joi.min(this.props.min);
    if (this.props.format) joi = joi.format(this.props.format);

    return joi;
  }

  toJSON(): Object {
    const json = _.clone(this.props);

    json.type = 'date';

    return json;
  }

}

export default DateType;
