import Joi from 'joi';
import _ from 'lodash';

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
   * @param {Object} definition definition object.
   * @constructor
   * @throws {TypeError} if definition object is invalid or unspecified.
   */
  constructor(definition: Object) {
    this.definition = _.mapValues(definition, (obj, key) => {
      // make sure obj is plain object
      if (!_.isPlainObject(obj)) {
        throw new TypeError(`Invalid schema definition for ${key}; expected plain object`);
      }

      // make sure obj is of valid type
      if (!Types.hasOwnProperty(obj.type)) {
        throw new TypeError(`Invalid schema datatype for ${key}`);
      }

      // create new datatype
      const type = new Types[obj.type];

      // update datatype props
      _.forOwn(obj, (v, k) => {
        if (k === 'type') return;

        if (typeof type[k] !== 'function') {
          throw new TypeError(`Invalid property "${k}" for "${obj.type}" datatype in "${key}"`);
        }

        type[k](v);
      });

      return type;
    });
  }

  // validate(records: Object | Array<Object>) {
  //   return _.mapValues(this.definition, (type) => {
  //     return type.toJoi();
  //   });
  // }

  toMetaData(): Object {
    return this.definition;
  }

  static fromMetaData(obj: Object): Schema {
    return new Schema(obj);
  }

}

export default Schema;
