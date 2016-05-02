import _ from 'lodash';
import Joi from 'joi';
import Any from './Any';

class UUID extends Any {

  toJoi() {
    let joi = Joi.string().guid().strict(true);

    if (!_.isUndefined(this.props.default)) joi = joi.default(this.props.default);
    if (this.props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'uuid' })
      .value();
  }

}

export default UUID;
