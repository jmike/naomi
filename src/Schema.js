import _ from 'lodash';
import Promise from 'bluebird';
import Joi from 'joi';
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
   * Creates a new Schema based on the specified definition object.
   * @param {Object} definition the definition object.
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
        throw new TypeError(`Invalid datatype ${obj.type} for ${key}`);
      }

      // create new datatype
      const type = new Types[obj.type];

      // update datatype props
      _.forOwn(obj, (v, k) => {
        if (k === 'type') return;

        if (typeof type[k] !== 'function') {
          throw new TypeError(`Invalid property ${k} for ${key}`);
        }

        type[k](v);
      });

      return type;
    });
  }

  toJSON() {
    return _.mapValues(this.definition, (datatype) => datatype.toJSON());
  }

  toJoi() {
    return _.mapValues(this.definition, (datatype) => datatype.toJoi());
  }

  validate(record: Object, callback: ?Function) {
    if (!this.joi) this.joi = this.toJoi();

    return new Promise((resolve, reject) => {
      Joi.validate(record, this.joi, {convert: false}, (err) => {
        if (err) return reject(new CustomError(err, 'ValidationError'));
        resolve();
      });
    }).nodeify(callback);
  }

  toMetaData(): Object {
    return this.definition;
  }

  static fromMetaData(obj: Object): Schema {
    return new Schema(obj);
  }

}

export default Schema;
