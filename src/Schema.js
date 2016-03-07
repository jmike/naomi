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
    this.primaryKeys = {};
    this.indices = {};
    this.uniqueIndices = {};

    // update columns based on definition object
    this.extend(definition);
  }

  /**
   * Extends schema with the given definition object.
   * @param {Object} definition the definition object.
   * @throws {TypeError} if definition object is invalid or unspecified.
   */
  extend(definition: Object): void {
    // make sure definition is plain object
    if (!_.isPlainObject(definition)) {
      throw new TypeError(`Invalid definition argument; expected plain object, received ${type(definition)}`);
    }

    _.forOwn(definition, (props, key) => {
      // make sure datatype is valid
      if (!datatypes.hasOwnProperty(props.type)) {
        throw new TypeError(`Unknown datatype ${props.type}`);
      }

      // create new datatype
      const dt = new datatypes[props.type];

      // set datatype properties
      _.chain(props).omit('type').forOwn((v, k) => dt[k] = v);

      // update definition object
      _.set(this.columns, key, dt);
    });
  }

  /**
   * Creates the supplied index in schema.
   * @param {Object} keys a plain object that contains key-value pairs, where key is the name of the column and value describes the relative type of index, i.e. 1 for ASC, -1 for DESC.
   * @param {Object} [options] index options.
   * @param {string} [options.name] the name of the index.
   * @param {string} [options.type="index"] the type of the index, i.e. "primary", "unique" or "index".
   * @throws {TypeError} if arguments are invalid.
   */
  index(keys: Object, options: ?{name: ?string, type: ?string}): void {
    // make sure keys is plain object
    if (_.isPlainObject(keys)) {
      throw new TypeError(`Invalid keys argument; expected plain object, received ${type(keys)}`);
    }

    // make sure keys is not empty
    if (_.isEmpty(keys)) {
      throw new TypeError(`Invalid keys argument; object must not be empty`);
    }

    // validate keys contents
    keys.forOwn((order, key) => {
      // make sure keys exist in schema definition
      if (!this.hasColumn(key)) {
        throw new TypeError(`Key "${key}" not found in schema definition`);
      }

      // make sure order is number
      if (!_.isNumber(order)) {
        throw new TypeError(`Invalid order for key "${key}"; expected number, received ${type(order)}`);
      }

      // make sure order is specifically one of 1 or -1
      if (order !== 1 && order !== -1) {
        throw new TypeError(`Invalid order for key "${key}"; expected 1 (i.e. ASC) or -1 (i.e. DESC), received ${order}`);
      }
    });

    // handle options
    options = _.defaults(options, {type: 'index'});

    switch (options.type) {
    case 'index':
      if (_.isNil(options.name)) {
        options.name = 'idx' + (_.size(this.indices) + 1);
      }

      // make sure index is not already defined in unique indices
      if (_.has(this.uniqueIndices, options.name)) {
        throw new Error(`Index ${options.name} is already set as unique index in schema`);
      }

      this.indices[options.name] = keys;
      break;

    case 'unique':
      if (_.isNil(options.name)) {
        options.name = 'uidx' + (_.size(this.uniqueIndices) + 1);
      }

      // make sure index is not already defined in plain indices
      if (_.has(this.indices, options.name)) {
        throw new Error(`Unique index ${options.name} is already set as plain index in schema`);
      }

      this.uniqueIndices[options.name] = keys;
      break;

    case 'primary':
      this.primaryKeys = keys;
      break;

    default:
      throw new TypeError(`Invalid type option; expected "index", "unique" or "primary", received "${options.type}"`);
    }
  }

  /**
   * Indicates whether the specified column exists in schema.
   * @param {string} column the name of the column.
   * @returns {boolean}
   */
  hasColumn(column: string): boolean {
    return _.has(this.columns, column);
  }

  /**
   * Indicates whether the specified column is automatically incremented.
   * @param {string} column the name of the column.
   * @returns {boolean}
   */
  isAutoInc(column: string): boolean {
    const dt = _.get(this.columns, column);

    // make sure column exists
    if (_.isUndefined(dt)) {
      return false;
    }

    return dt.props.autoinc === true;
  }

  /**
   * Returns an array of column names specified in schema.
   * @return {Array<string>}
   */
  getColumnNames(): Array<string> {
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

  toJoi(): Joi {
    return Joi.object()
      .strict(true)
      .keys(_.mapValues(this.columns, (datatype) => datatype.toJoi()));
  }

  toJSON(): Object {
    return _.mapValues(this.columns, (datatype) => datatype.toJSON());
  }

}

export default Schema;
