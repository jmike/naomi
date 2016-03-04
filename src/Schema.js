import _ from 'lodash';
import Promise from 'bluebird';
import Joi from 'joi';
import type from 'type-of';
import CustomError from 'customerror';

import UUIDType from './datatypes/UUID';
import StringType from './datatypes/String';
import EnumType from './datatypes/Enum';
import NumberType from './datatypes/Number';
import FloatType from './datatypes/Float';
import IntegerType from './datatypes/Integer';
import DateType from './datatypes/Date';

const datatypes = {
  date: DateType,
  enum: EnumType,
  float: FloatType,
  integer: IntegerType,
  number: NumberType,
  string: StringType,
  uuid: UUIDType,
};

class Schema {

  /**
   * Creates a new Schema based on the specified definition object.
   * @param {Object} definition the definition object.
   * @constructor
   * @throws {TypeError} if definition object is invalid or unspecified.
   */
  constructor(definition: Object) {
    // make sure definition is plain object
    if (!_.isPlainObject(definition)) {
      throw new TypeError(`Invalid definition argument; expected plain object, received ${type(definition)}`);
    }

    this.columns = {};
    this.primaryKey = [];
    this.uniqueKeys = {};
    this.indexKeys = {};

    // update columns based on definition object
    _.forOwn(definition, (props, key) => {
      this.extend(key, props);
    });
  }

  extend(key: string, props: Object) {
    // make sure props is plain object
    if (!_.isPlainObject(props)) {
      throw new TypeError(`Invalid props argument; expected plain object, received ${type(props)}`);
    }

    // make sure datatype is valid
    if (!datatypes.hasOwnProperty(props.type)) {
      throw new TypeError(`Unknown datatype ${props.type}`);
    }

    // create new datatype
    const dt = new datatypes[props.type];

    // set datatype properties
    _.forOwn(props, (v, k) => {
      if (k === 'type') return; // exclude type
      dt[k] = v;
    });

    // update definition object
    _.set(this.columns, key, dt);
  }

  getColumnNames() {
    return _.keys(this.definition);
  }

  toJSON() {
    return _.mapValues(this.definition, (datatype) => datatype.toJSON());
  }

  toJoi() {
    return Joi.object().strict(true).keys(_.mapValues(this.definition, (datatype) => datatype.toJoi()));
  }

  validate(record: Object, callback: ?Function) {
    if (!this.joi) this.joi = this.toJoi();

    return new Promise((resolve, reject) => {
      Joi.validate(record, this.joi, {convert: false}, (err, value) => {
        if (err) return reject(new CustomError(err, 'ValidationError'));
        resolve(value);
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
