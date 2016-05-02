import _ from 'lodash';
import Joi from 'joi';
import type from 'type-of';
import Any from './Any';

class Enum extends Any {

  values(...args) {
    if (args.length === 0) {
      throw new Error('You must specify at least on values argument');
    }

    if (args.length === 1 && _.isArray(args[0])) {
      this.values.apply(this, args[0]);
      return; // exit
    }

    args.forEach((e) => {
      if (!_.isString(e)) {
        throw new TypeError(`Invalid values argument; expected string, received ${type(e)}`);
      }
    });

    this.props.values = args;
  }

  toJoi() {
    let joi = Joi.string().strict(true);

    if (!_.isUndefined(this.props.default)) joi = joi.default(this.props.default);
    if (this.props.values) joi = joi.valid(this.props.values);
    if (this.props.nullable) joi = joi.optional().allow(null);

    return joi;
  }

  toJSON() {
    return _.chain(this.props)
      .clone()
      .assign({ type: 'enum' })
      .value();
  }

}

export default Enum;
