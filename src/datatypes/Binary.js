import _ from 'lodash';
import Joi from 'joi';
import AnyType from './Any';

class BinaryType extends AnyType {

  constructor() {
    super();
  }

  set minLength(v: number): void {
    this.props.minLength = v;
  }

  set maxLength(v: number): void {
    this.props.maxLength = v;
  }

  set length(v: number): void {
    this.props.length = v;
  }

  set encoding(v: string): void {
    this.props.encoding = v;
  }

  toJoi(): Object {
    let joi = Joi.binary().strict(true);

    if (!_.isUndefined(this.props.maxLength)) joi = joi.max(this.props.maxLength);
    if (!_.isUndefined(this.props.minLength)) joi = joi.min(this.props.minLength);
    if (!_.isUndefined(this.props.length)) joi = joi.length(this.props.length);
    if (!_.isUndefined(this.props.encoding)) joi = joi.encoding(this.props.encoding);
    if (this.props.nullable) joi = joi.optional().allow(null);
    if (this.props.default) joi = joi.default(this.props.default);

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'binary'})
      .value();
  }

}

export default BinaryType;
