import _ from 'lodash';
import Promise from 'bluebird';
import Joi from 'joi';
import type from 'type-of';
import CustomError from 'customerror';
import datatypes from './datatypes';

class Schema {

  /**
   * Creates a new Schema based on the supplied spec object.
   * @param {Object} spec a schema spec object.
   * @constructor
   * @throws {TypeError} if spec object is invalid or unspecified.
   */
  constructor(spec) {
    // make sure spec is plain object
    if (!_.isPlainObject(spec)) {
      throw new TypeError(`Invalid spec variable; expected plain object, received ${type(spec)}`);
    }

    this._keys = {};
    this._primaryKey = {};
    this._indexKeys = {};
    this._uniqueKeys = {};

    // eat your own dog food
    this.extend(spec);
  }

  /**
   * Extends schema with the supplied spec object.
   * @param {Object} spec a schema spec object.
   * @throws {TypeError} if spec object is invalid or unspecified.
   * @returns {Schema} this schema to allow method chaining.
   */
  extend(spec) {
    if (!_.isPlainObject(spec)) {
      throw new TypeError(`Invalid schema spec; expected plain object, received ${type(spec)}`);
    }

    _.forOwn(spec, (value, key) => {
      // make sure value is object
      if (!_.isPlainObject(value)) {
        throw new TypeError(`Invalid value for key "${key}" in schema spec; expected plain object, received ${type(value)}`);
      }

      // make sure value type is valid
      if (!datatypes.hasOwnProperty(value.type)) {
        throw new TypeError(`Unknown datatype "${value.type}" for key "${key}" in schema spec`);
      }

      // create datatype
      const datatype = datatypes[value.type]();

      // set datatype properties
      _.forOwn(value, (v, k) => {
        if (k === 'type') return; // exclude type
        datatype[k](v);
      });

      // push datatype to keys
      _.set(this._keys, key, datatype);
    });

    return this;
  }

  /**
   * Creates the specified index in schema.
   * @param {Object} payload key-value pairs, where key represent some keys of this schema and value describes the type of the index, i.e. 1 for ASC, -1 for DESC.
   * @param {Object} [options] index options.
   * @param {string} [options.name] the name of the index.
   * @param {string} [options.type="index"] the type of the index, i.e. "primary", "unique" or "index".
   * @throws {TypeError} if arguments are invalid.
   * @returns {Schema} this schema to allow method chaining.
   */
  index(payload, options) {
    // make sure payload is plain object
    if (!_.isPlainObject(payload)) {
      throw new TypeError(`Invalid index payload; expected plain object, received ${type(payload)}`);
    }

    // make sure payload is not empty
    if (_.isEmpty(payload)) {
      throw new TypeError(`Invalid index payload; object must not be empty`);
    }

    // validate payload
    _.forOwn(payload, (order, key) => {
      // make sure keys exist in schema
      if (!this.hasKey(key)) {
        throw new TypeError(`Unknown key "${key}" not found in schema`);
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

    // handle optional arguments
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

      this._indexKeys[options.name] = payload;
      break;

    case 'unique':
      if (_.isNil(options.name)) {
        options.name = 'uidx' + (_.size(this._uniqueKeys) + 1);
      }

      // make sure index is not already defined in plain indices
      if (_.has(this._indexKeys, options.name)) {
        throw new Error(`Unique index ${options.name} is already set as plain index in schema`);
      }

      this._uniqueKeys[options.name] = payload;
      break;

    case 'primary':
      this._primaryKey = payload;
      break;

    default:
      throw new TypeError(`Invalid type option; expected "index", "unique" or "primary", received "${options.type}"`);
    }

    // allow method chaining
    return this;
  }

  /**
   * Indicates whether the specified key exists in schema.
   * @param {string} key the name of the key.
   * @returns {boolean}
   */
  hasKey(key) {
    if (!_.isString(key)) {
      throw new TypeError(`Invalid key variable; expected string, received ${type(key)}`);
    }

    return _.has(this._keys, key);
  }

  /**
   * Returns an array of keys specified in this schema.
   * @return {Array<string>}
   */
  getKeys() {
    return _.keys(this._keys);
  }

  /**
   * Returns an array of keys that compose the primary key.
   * @return {Array<string>}
   */
  getPrimaryKey() {
    return _.keys(this._primaryKey);
  }

  /**
   * Returns an array of keys that compose the designate unique key.
   * @param {string} name: the name of the unique key index.
   * @return {Array<string>}
   */
  getUniqueKey(name) {
    if (!_.isString(name)) {
      throw new TypeError(`Invalid name variable; expected string, received ${type(name)}`);
    }

    const obj = this._uniqueKeys[name];

    if (obj === undefined) {
      throw new Error(`Unknown unique key "${name}" not found in schema`);
    }

    return _.keys(obj);
  }

  /**
   * Returns an array of keys that compose the designate index key.
   * @param {string} name: the name of the index key index.
   * @return {Array<string>}
   */
  getIndexKey(name: string) {
    if (!_.isString(name)) {
      throw new TypeError(`Invalid name variable; expected string, received ${type(name)}`);
    }

    const obj = this._indexKeys[name];

    if (obj === undefined) {
      throw new Error(`Unknown index key "${name}" not found in schema`);
    }

    return _.keys(obj);
  }

  /**
   * Indicates whether the specified key is automatically incremented.
   * @param {string} key the name of the key.
   * @returns {boolean}
   * @throws {Error} If key does not exist in schema.
   */
  isKeyAutoInc(key) {
    if (!_.isString(key)) {
      throw new TypeError(`Invalid key variable; expected string, received ${type(key)}`);
    }

    if (!this.hasKey(key)) {
      throw new Error(`Unknown key "${key}" not found in schema`);
    }

    return _.get(this._keys, key).toJSON().autoinc === true;
  }

  /**
   * Indicates whether the specified key(s) compose the primary key of this schema.
   * Primary keys may be compound, i.e. composed of multiple keys. Hence the acceptance of multiple params in this function.
   * @param {...string} keys the name of the keys.
   * @returns {boolean}
   */
  isPrimaryKey(...keys) {
    if (keys.length === 0) {
      throw new TypeError('You must specify at least 1 key argument');
    }

    return _.chain(this._primaryKey).keys().xor(keys).size().value() === 0;
  }

  /*
   * Indicates whether the specified keys(s) represent a unique key in this schema.
   * Unique keys may be compound, i.e. composed of multiple keys, hence the acceptance of multiple params.
   * @param {...string} keys the name of the keys.
   * @returns {boolean}
   */
  isUniqueKey(...keys) {
    if (keys.length === 0) {
      throw new TypeError('You must specify at least 1 key argument');
    }

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
  isIndexKey(...keys) {
    if (keys.length === 0) {
      throw new TypeError('You must specify at least 1 key argument');
    }

    return _.some(this._indexKeys, function (obj) {
      return _.xor(_.keys(obj), keys).length === 0;
    });
  }

  /**
   * Indicates whether the table has an atomic (i.e. consisted of a single key) primary key.
   * @returns {boolean}
   */
  hasAtomicPrimaryKey() {
    const keys = this.getPrimaryKey();
    return keys.length === 1;
  }

  /**
   * Indicates whether the table has an atomic (i.e. consisted of a single key) auto-incremented primary key.
   * @returns {boolean}
   */
  hasAutoIncPrimaryKey() {
    const keys = this.getPrimaryKey();
    return keys.length === 1 && this.isKeyAutoInc(keys[0]);
  }

  _createJoi(...keys) {
    const obj = _.pick(this._keys, keys);

    return Joi.object()
      .strict(true)
      .keys(_.mapValues(obj, (datatype) => {
        return datatype.toJoi();
      }));
  }

  /**
   * Validates the designated record against this schema.
   * @param {Object} record the record to validate.
   * @param {Array<string>} [keys] optional array of keys to include in validation.
   * @param {Function<Error, Object>} [callback] an optional callback function.
   * @return {Promise<Object>}
   */
  validate(record, keys, callback) {
    if (!_.isObject(record)) {
      throw new TypeError(`Invalid record variable; expected object, received ${type(record)}`);
    }

    if (_.isFunction(keys)) {
      callback = keys;
      keys = this.getKeys();
    } else if (_.isUndefined(keys)) {
      keys = this.getKeys();
    }

    if (!_.isArray(keys)) {
      throw new TypeError(`Invalid keys variable; expected array, received ${type(keys)}`);
    }

    const joi = this._createJoi(keys);

    return new Promise((resolve, reject) => {
      Joi.validate(record, joi, {convert: false}, (err, value) => {
        if (err) return reject(new CustomError(err, 'ValidationError'));
        resolve(value);
      });
    }).nodeify(callback);
  }

  toJoi() {
    return this._createJoi(this._keys);
  }

  toJSON(): Object {
    return _.mapValues(this._keys, (datatype) => datatype.toJSON());
  }
}

export default Schema;
