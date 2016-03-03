import _ from 'lodash';
import Joi from 'joi';
import AnyType from './Any';

class UUIDType extends AnyType {

  constructor() {
    super();
  }

  toJoi(): Object {
    let joi = Joi.string().guid().strict(true);

    if (this.props.nullable) joi = joi.optional();
    if (this.props.default) joi = joi.default(this.props.default);

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'uuid'})
      .value();
  }

}

export default UUIDType;
