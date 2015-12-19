import Joi from 'joi';
import _ from 'lodash';

class Schema {

  /**
   * Creates a new Schema based on the supplied definition object.
   * @param {Object} obj definition object.
   * @constructor
   * @throws {TypeError} if definition object is invalid or unspecified.
   */
  constructor(obj: Object) {
    _.forOwn(obj, (value) => {
      // make sure value is plain object
      if (!_.isPlainObject(value)) {
        throw new TypeError(`Invalid schema definition for #{key}; expected plain object`);
      }

      // switch (value.type) {
      // case 'string':

      //   break;
      // default:
      //   throw new CustomError(`Invalid schema datatype for #{key}`, 'InvalidSchema');
      // }
    });

    this.definition = obj;
  }

  toJoi(): Joi {
    return _.mapValues(this.definition, (obj) => {
      const joi = Joi[obj.type]();
      return joi;
    });
  }

  static fromMetaData(obj: Object): Schema {
    return new Schema(obj);
  }

}

export default Schema;
