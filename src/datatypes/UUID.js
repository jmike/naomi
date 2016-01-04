import _ from 'lodash';
import Joi from 'joi';

class UUIDType {

  constructor() {
    this.props = {};
  }

  toJoi(): Object {
    return Joi.string().guid().strict(true);
  }

  toJSON(): Object {
    const json = _.clone(this.props);

    json.type = 'uuid';

    return json;
  }

}

export default UUIDType;
