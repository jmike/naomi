import _ from 'lodash';
import Joi from 'joi';

class AnyType {

  constructor() {
    this.props = {};
  }

  set nullable(v: boolean): void {
    this.props.nullable = v;
  }

  set default(v): void {
    this.props.default = v;
  }

  toJoi(): Object {
    let joi = Joi.any().strict(true);

    if (this.props.nullable) joi = joi.optional();
    if (this.props.default) joi = joi.default(this.props.default);

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'any'})
      .value();
  }

}

export default AnyType;
