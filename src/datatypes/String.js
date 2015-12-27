import _ from 'lodash';
import Joi from 'joi';

class StringType {

  constructor() {
    this.props = {};
  }

  set minLength(v: number): void {
    this.props.minLength = v;
  }

  get minLength(): number {
    return this.props.minLength;
  }

  set maxLength(v: number): void {
    this.props.maxLength = v;
  }

  get maxLength(): number {
    return this.props.maxLength;
  }

  set length(v: number): void {
    this.props.length = v;
  }

  get length(): number {
    return this.props.length;
  }

  set regex(v: string | RegExp): void {
    if (_.isString(v)) {
      v = new RegExp(v);
    }

    this.props.regex = v;
  }

  get regex(): RegExp {
    return this.props.regex;
  }

  set lowercase(v: boolean): void {
    this.props.lowercase = v;
  }

  get lowercase(): boolean {
    return this.props.lowercase;
  }

  set uppercase(v: boolean): void {
    this.props.uppercase = v;
  }

  get uppercase(): boolean {
    return this.props.uppercase;
  }

  set trim(v: boolean): void {
    this.props.trim = v;
  }

  get trim(): boolean {
    return this.props.trim;
  }

  toJoi(): Joi {
    const joi = Joi.string().strict(true);

    if (this.props.maxLength) joi.maxlength(this.props.maxLength);
    if (this.props.minLength) joi.minlength(this.props.minLength);
    if (this.props.length) joi.length(this.props.length);
    if (this.props.regex) joi.regex(this.props.regex);
    if (this.props.lowercase) joi.lowercase();
    if (this.props.uppercase) joi.uppercase();
    if (this.props.trim) joi.trim();

    return joi;
  }

  toJSON(): Object {
    const json = _.clone(this.props);

    json.type = 'string';

    if (json.regex) {
      json.regex = json.regex.toString();
    }

    return json;
  }

}

export default StringType;
