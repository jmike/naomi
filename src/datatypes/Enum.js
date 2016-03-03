import _ from 'lodash';
import Joi from 'joi';
import AnyType from './Any';

class EnumType extends AnyType {

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
    return _.chain(this.props)
      .clone()
      .assign({type: 'enum'})
      .value();
  }

}

export default EnumType;
