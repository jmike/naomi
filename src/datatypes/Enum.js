import _ from 'lodash';
import Joi from 'joi';

class EnumType {

  constructor() {
    this.props = {};
  }

  set values(v: Array<string>): void {
    this.props.values = v;
  }

  toJoi(): Object {
    let joi = Joi.string().strict(true);

    if (this.props.values) joi = joi.valid(this.props.values);

    return joi;
  }

  toJSON(): Object {
    const json = _.clone(this.props);

    json.type = 'enum';

    return json;
  }

}

export default EnumType;
