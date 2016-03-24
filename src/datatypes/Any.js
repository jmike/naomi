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
    if (_.isFunction(v) && _.isUndefined(v.description)) {
      v.description = v.name; // name of the function
    }

    this.props.default = v;
  }

  toJoi(): Object {
    let joi = Joi.any().strict(true);

    if (this.props.nullable) joi = joi.optional().allow(null);
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
