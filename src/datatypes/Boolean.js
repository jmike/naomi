import _ from 'lodash';
import Joi from 'joi';
import AnyType from './Any';

class BooleanType extends AnyType {

  constructor() {
    super();
  }

  toJoi(): Object {
    let joi = Joi.boolean().strict(true);

    if (this.props.nullable) joi = joi.optional().allow(null);
    if (this.props.default) joi = joi.default(this.props.default);

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'boolean'})
      .value();
  }

}

export default BooleanType;
