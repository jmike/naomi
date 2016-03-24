import _ from 'lodash';
import Joi from 'joi';
import AnyType from './Any';

class EmailType extends AnyType {

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

  set lowercase(v: boolean): void {
    this.props.lowercase = v;
  }

  set uppercase(v: boolean): void {
    this.props.uppercase = v;
  }

  set trim(v: boolean): void {
    this.props.trim = v;
  }

  toJoi(): Object {
    let joi = Joi.string().email().strict(true);

    if (!_.isUndefined(this.props.maxLength)) joi = joi.max(this.props.maxLength);
    if (!_.isUndefined(this.props.minLength)) joi = joi.min(this.props.minLength);
    if (!_.isUndefined(this.props.length)) joi = joi.length(this.props.length);
    if (!_.isUndefined(this.props.default)) joi = joi.default(this.props.default);
    if (this.props.lowercase) joi = joi.lowercase();
    if (this.props.uppercase) joi = joi.uppercase();
    if (this.props.trim) joi = joi.trim();
    if (this.props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'email'})
      .value();
  }

}

export default EmailType;
