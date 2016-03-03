import _ from 'lodash';
import Joi from 'joi';
import AnyType from './Any';

class UUIDType extends AnyType {

  constructor() {
    this.props = {};
  }

  toJoi(): Object {
    return Joi.string().guid().strict(true);
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'uuid'})
      .value();
  }

}

export default UUIDType;
