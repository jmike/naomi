import _ from 'lodash';
import Joi from 'joi';
import String from './String';

class Email extends String {

  toJoi() {
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

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'email' })
      .value();
  }

}

export default Email;
