import Joi from 'joi';
import _ from 'lodash';
import CustomError from 'customerror';

import UUIDType from './datatypes/UUID';
import StringType from './datatypes/String';
import EnumType from './datatypes/Enum';
import NumberType from './datatypes/Number';
import FloatType from './datatypes/Float';
import IntegerType from './datatypes/Integer';
import DateType from './datatypes/Date';

const Types = {
  uuid: UUIDType,
  string: StringType,
  enum: EnumType,
  number: NumberType,
  float: FloatType,
  integer: IntegerType,
  date: DateType
};

class Schema {

  /**
   * Creates a new Schema based on the supplied definition object.
   * @param {Object} obj definition object.
   * @constructor
   * @throws {TypeError} if definition object is invalid or unspecified.
   */
  constructor(obj: Object) {
    this.definition = {};

    _.forOwn(obj, (value, key) => {
      // make sure value is plain object
      if (!_.isPlainObject(value)) {
        throw new TypeError(`Invalid schema definition for #{key}; expected plain object`);
      }

      if (!_.has[Types, value.type]) {
        throw new CustomError(`Invalid schema datatype for #{key}`, 'InvalidSchema');
      }

      const type = new Types[value.type];
      _.forOwn((v, k) => type[k] = v);

      this.definition[key] = type;
    });
  }

  toJoi(): Joi {
    return _.mapValues(this.definition, (type) => {
      return type.toJoi();
    });
  }

  static fromMetaData(obj: Object): Schema {
    return new Schema(obj);
  }

}

export default Schema;
