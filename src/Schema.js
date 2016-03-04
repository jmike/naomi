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

  /**
   * Indicates whether the specified column exists in schema.
   * @param {string} key the name of the column.
   * @returns {boolean}
   */
  hasColumn(key) {
    return _.has(this.columns, key);
  }

  /**
   * Indicates whether the specified column is automatically incremented.
   * @param {string} key the name of the column.
   * @returns {boolean}
   */
  isAutoInc(key) {
    const column = _.get(this.columns, key);

    // make sure column exists
    if (_.isUndefined(column)) {
      return false;
    }

    return column.props.autoinc === true;
  }

  /**
   * Returns an array of column names specified in schema.
   * @return {Array<string>}
   */
  getColumnNames() {
    return _.keys(this.columns);
  }

  /**
   * Indicates whether the specified column(s) represent a primary key.
   * Primary keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params in this function.
   * This method will always return false until database is ready.
   * @param {...string} columns the name of the columns.
   * @returns {boolean}
   * @example
   */
  // isPrimaryKey() {
  //   var columns = Array.prototype.slice.call(arguments, 0);
  //   return _.xor(this.primaryKey, columns).length === 0;
  // }

  /**
   * Indicates whether the specified column(s) represent a unique key.
   * Unique keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
   * This method will always return false until database is ready.
   * @param {...string} columns the name of the columns.
   * @returns {boolean}
   * @example
   *
   * table.isUniqueKey('pid');
   */
  // isUniqueKey() {
  //   var columns = Array.prototype.slice.call(arguments, 0);
  //   return _.some(this.uniqueKeys, function (e) {
  //     return _.xor(e, columns).length === 0;
  //   });
  // }

  /**
   * Indicates whether the specified column(s) represent an index key.
   * Index keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params.
   * This method will always return false until database is ready.
   * @param {...string} columns the name of the columns.
   * @returns {boolean}
   * @example
   *
   * table.isIndexKey('firstName', 'lastName');
   */
  // isIndexKey() {
  //   var columns = Array.prototype.slice.call(arguments, 0);
  //   return _.some(this.indexKeys, function (e) {
  //     return _.xor(e, columns).length === 0;
  //   });
  // }

  /**
   * Indicates whether the table has a simple automatically incremented primary key.
   * This method will always return false until database is ready.
   * @returns {boolean}
   * @example
   *
   * table.hasAutoIncPrimaryKey();
   */
  // hasAutoIncPrimaryKey() {
  //   return this.primaryKey.length === 1 && this.isAutoInc(this.primaryKey[0]);
  // }

  /**
   * Validates the designated record against this schema.
   * @param {Object} record the record to validate.
   * @param {Function<Error, Object>} callback an optional callback function.
   * @return {Promise<Object>}
   */
  validate(record: Object, callback: ?Function): Promise {
    // make sure joi exists
    if (!this.joi) {
      this.joi = this.toJoi(); // cache to instance property
    }

    return new Promise((resolve, reject) => {
      Joi.validate(record, this.joi, {convert: false}, (err, value) => {
        if (err) return reject(new CustomError(err, 'ValidationError'));
        resolve(value);
      });
    }).nodeify(callback);
  }

  toMetaData(): Object {
    return this.columns;
  }

  static fromMetaData(obj: Object): Schema {
    return new Schema(obj);
  }

  toJoi() {
    return Joi.object()
      .strict(true)
      .keys(_.mapValues(this.columns, (datatype) => datatype.toJoi()));
  }

  toJSON() {
    return _.mapValues(this.columns, (datatype) => datatype.toJSON());
  }

}

export default Schema;
