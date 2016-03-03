import _ from 'lodash';
import Joi from 'joi';
import AnyType from './Any';

class StringType extends AnyType {

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

  set regex(v: string | RegExp): void {
    if (_.isString(v)) {
      v = new RegExp(v);
    }

    this.props.regex = v;
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
    let joi = Joi.string().strict(true);

    if (!_.isUndefined(this.props.maxLength)) joi = joi.max(this.props.maxLength);
    if (!_.isUndefined(this.props.minLength)) joi = joi.min(this.props.minLength);
    if (!_.isUndefined(this.props.length)) joi = joi.length(this.props.length);
    if (this.props.regex) joi = joi.regex(this.props.regex);
    if (this.props.lowercase) joi = joi.lowercase();
    if (this.props.uppercase) joi = joi.uppercase();
    if (this.props.trim) joi = joi.trim();
    if (this.props.nullable) joi = joi.optional();
    if (this.props.default) joi = joi.default(this.props.default);

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'string'})
      .tap((json) => {
        if (json.regex) {
          json.regex = json.regex.toString();
        }
      })
      .value();
  }

}

export default StringType;
