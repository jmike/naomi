import _ from 'lodash';
import Joi from 'joi';

class EnumType {

  constructor() {
    this.props = {};
  }

  values(v: Array<string>): EnumType {
    this.props.values = v;
    return this;
  }

  toJoi(): Object {
    const joi = Joi.string().strict(true);

    if (this.props.values) joi.valid(this.props.values);

    return joi;
  }

  toJSON(): Object {
    const json = _.clone(this.props);

    json.type = 'enum';

    return json;
  }

}

export default EnumType;
