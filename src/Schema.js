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
   * Creates a new Schema based on the supplied definition object.
   * @param {Object} definition a schema definition object.
   * @constructor
   * @throws {TypeError} if definition object is invalid or unspecified.
   */
  constructor(definition: Object) {
    // make sure definition is plain object
    if (!_.isPlainObject(definition)) {
      throw new TypeError(`Invalid definition argument; expected plain object, received ${type(definition)}`);
    }

    this._keys = {};
    this._primaryKey = {};
    this._indexKeys = {};
    this._uniqueKeys = {};

    // eat your own dog food
    this.extend(definition);
  }

  /**
   * Extends schema with the supplied definition object.
   * @param {Object} definition a schema definition object.
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
      _.forOwn(_.omit(props, 'type'), (v, k) => {
        dt[k] = v;
      });

      // update definition object
      _.set(this._keys, key, dt);
    });
  }

  /**
   * Creates the specified index in schema.
   * @param {Object} keys an object of key-value pairs, where value describes the related type of the index, i.e. 1 for ASC, -1 for DESC.
   * @param {Object} [options] index options.
   * @param {string} [options.name] the name of the index.
   * @param {string} [options.type="index"] the type of the index, i.e. "primary", "unique" or "index".
   * @throws {TypeError} if arguments are invalid.
   */
  index(keys: Object, options: ?{name: ?string, type: ?string}): void {
    // make sure keys is plain object
    if (!_.isPlainObject(keys)) {
      throw new TypeError(`Invalid keys argument; expected plain object, received ${type(keys)}`);
    }

    // make sure keys is not empty
    if (_.isEmpty(keys)) {
      throw new TypeError(`Invalid keys argument; object must not be empty`);
    }

    // iterate keys contents
    _.forOwn(keys, (order, key) => {
      // make sure keys exist in schema definition
      if (!this.has(key)) {
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
        options.name = 'idx' + (_.size(this._indexKeys) + 1);
      }

      // make sure index is not already defined in unique indices
      if (_.has(this._uniqueKeys, options.name)) {
        throw new Error(`Index ${options.name} is already set as unique index in schema`);
      }

      this._indexKeys[options.name] = keys;
      break;

    case 'unique':
      if (_.isNil(options.name)) {
        options.name = 'uidx' + (_.size(this._uniqueKeys) + 1);
      }

      // make sure index is not already defined in plain indices
      if (_.has(this._indexKeys, options.name)) {
        throw new Error(`Unique index ${options.name} is already set as plain index in schema`);
      }

      this._uniqueKeys[options.name] = keys;
      break;

    case 'primary':
      this._primaryKey = keys;
      break;

    default:
      throw new TypeError(`Invalid type option; expected "index", "unique" or "primary", received "${options.type}"`);
    }
  }

  /**
   * Indicates whether the specified key exists in schema.
   * @param {string} key the name of the key.
   * @returns {boolean}
   */
  has(key: string): boolean {
    return _.has(this._keys, key);
  }

  /**
   * Returns an array of keys specified in this schema.
   * @return {Array<string>}
   */
  keys(): Array<string> {
    return _.keys(this._keys);
  }

  /**
   * Indicates whether the specified key is automatically incremented.
   * @param {string} key the name of the key.
   * @returns {boolean}
   * @throws {Error} If key does not exist in schema.
   */
  isAutoInc(key: string): boolean {
    const dt = _.get(this._keys, key);

    // make sure key exists
    if (_.isUndefined(dt)) {
      throw new Error(`Key "${key}" not found in schema definition`);
    }

    return dt.props.autoinc === true;
  }

  /**
   * Indicates whether the specified key(s) compose the primary key of this schema.
   * Primary keys may be compound, i.e. composed of multiple keys. Hence the acceptance of multiple params in this function.
   * @param {...string} keys the name of the keys.
   * @returns {boolean}
   */
  isPrimaryKey(...keys): boolean {
    return _.chain(this._primaryKey).keys().xor(keys).value().length === 0;
  }

  /*
   * Indicates whether the specified keys(s) represent a unique key in this schema.
   * Unique keys may be compound, i.e. composed of multiple keys, hence the acceptance of multiple params.
   * @param {...string} keys the name of the keys.
   * @returns {boolean}
   */
  isUniqueKey(...keys): boolean {
    return _.some(this._uniqueKeys, (obj) => {
      return _.xor(_.keys(obj), keys).length === 0;
    });
  }

  /*
   * Indicates whether the specified key(s) represent an index key.
   * Index keys may be compound, i.e. composed of multiple keys, hence the acceptance of multiple params.
   * @param {...string} keys the name of the keys.
   * @returns {boolean}
   */
  isIndexKey(...keys): boolean {
    return _.some(this._indexKeys, function (obj) {
      return _.xor(_.keys(obj), keys).length === 0;
    });
  }

  /**
   * Indicates whether the table has an atomic auto-incremented primary key.
   * This method will always return false until database is ready.
   * @returns {boolean}
   */
  hasAtomicAutoIncPrimaryKey() {
    const keys = _.keys(this._primaryKey);
    return keys.length === 1 && this.isAutoInc(keys[0]);
  }

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
    return this._keys;
  }

  static fromMetaData(obj: Object): Schema {
    return new Schema(obj);
  }

  toJoi() {
    return Joi.object()
      .strict(true)
      .keys(_.mapValues(this._keys, (datatype) => datatype.toJoi()));
  }

  toJSON(): Object {
    return _.mapValues(this._keys, (datatype) => datatype.toJSON());
  }

}

export default Schema;
