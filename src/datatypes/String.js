import _ from 'lodash';
import Joi from 'joi';

class StringType {

  constructor() {
    this.props = {};
  }

  minLength(v: number): StringType {
    this.props.minLength = v;
    return this;
  }

  maxLength(v: number): StringType {
    this.props.maxLength = v;
    return this;
  }

  length(v: number): StringType {
    this.props.length = v;
    return this;
  }

  regex(v: string | RegExp): StringType {
    if (_.isString(v)) {
      v = new RegExp(v);
    }

    this.props.regex = v;
    return this;
  }

  lowercase(v: boolean): StringType {
    this.props.lowercase = v;
    return this;
  }

  uppercase(v: boolean): StringType {
    this.props.uppercase = v;
    return this;
  }

  trim(v: boolean): StringType {
    this.props.trim = v;
    return this;
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
