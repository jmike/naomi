import _ from 'lodash';
import Promise from 'bluebird';
import Joi from 'joi';
import type from 'type-of';
import CustomError from 'customerror';
import datatypes from './datatypes';

class Schema {

  /**
   * Creates a new Schema based on the supplied definition object.
   * @param {Object} definition a schema definition object.
   * @constructor
   * @throws {TypeError} if definition object is invalid or unspecified.
   */
  constructor(definition: Object) {
    this._keys = {};
    this._primaryKey = {};
    this._indexKeys = {};
    this._uniqueKeys = {};
    this._joi = null;

    // eat your own dog food
    this.extend(definition);
  }

  /**
   * Extends schema with the supplied definition object.
   * @param {Object} definition a schema definition object.
   * @throws {TypeError} if definition object is invalid or unspecified.
   * @returns {Schema} this schema to allow method chaining.
   */
  extend(definition: Object): Schema {
    // make sure definition is plain object
    if (!_.isPlainObject(definition)) {
      throw new TypeError(`Invalid definition argument; expected plain object, received ${type(definition)}`);
    }

    // update _keys object
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

    // invalidate joi cache
    this._joi = null;

    // allow method chaining
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
  index(payload: Object, options: ?{name: ?string, type: ?string}): Schema {
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
      // make sure keys exist in schema definition
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
  hasKey(key: string): boolean {
    return _.has(this._keys, key);
  }

  /**
   * Returns an array of keys specified in this schema.
   * @return {Array<string>}
   */
  getKeys(): Array<string> {
    return _.keys(this._keys);
  }

  /**
   * Returns an array of keys that compose the primary key.
   * @return {Array<string>}
   */
  getPrimaryKey(): Array<string> {
    return _.keys(this._primaryKey);
  }

  /**
   * Returns an array of keys that compose the designate unique key.
   * @param {string} name: the name of the unique key index.
   * @return {Array<string>}
   */
  getUniqueKey(name: string): Array<string> {
    const obj = this._uniqueKeys[name];

    if (obj === undefined) {
      throw new Error(`Unknown unique-key "${name}" does not exist in schema`);
    }

    return _.keys(obj);
  }

  /**
   * Returns an array of keys that compose the designate index key.
   * @param {string} name: the name of the index key index.
   * @return {Array<string>}
   */
  getIndexKey(name: string): Array<string> {
    const obj = this._indexKeys[name];

    if (obj === undefined) {
      throw new Error(`Unknown index-key "${name}" does not exist in schema`);
    }

    return _.keys(obj);
  }

  /**
   * Indicates whether the specified key is automatically incremented.
   * @param {string} key the name of the key.
   * @returns {boolean}
   * @throws {Error} If key does not exist in schema.
   */
  isKeyAutoInc(key: string): boolean {
    if (!this.hasKey(key)) {
      throw new Error(`Unknown key "${key}" not found in schema`);
    }

    return _.get(this._keys, [key, 'props', 'autoinc']) === true;
  }

  /**
   * Indicates whether the specified key(s) compose the primary key of this schema.
   * Primary keys may be compound, i.e. composed of multiple keys. Hence the acceptance of multiple params in this function.
   * @param {...string} keys the name of the keys.
   * @returns {boolean}
   */
  isPrimaryKey(...keys): boolean {
    return _.chain(this._primaryKey).keys().xor(keys).size().value() === 0;
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

  /**
   * Validates the designated record against this schema.
   * @param {Object} record the record to validate.
   * @param {Function<Error, Object>} callback an optional callback function.
   * @return {Promise<Object>}
   */
  validate(record: Object, callback: ?Function): Promise {
    // cache joi
    if (!this._joi) {
      this._joi = this.toJoi();
    }

    return new Promise((resolve, reject) => {
      Joi.validate(record, this._joi, {convert: false}, (err, value) => {
        if (err) return reject(new CustomError(err, 'ValidationError'));
        resolve(value);
      });
    }).nodeify(callback);
  }

  toJoi(key: ?string) {
    if (_.isNil(key)) {
      return Joi.object()
        .strict(true)
        .keys(_.mapValues(this._keys, (datatype) => datatype.toJoi()));
    }

    if (!this.hasKey(key)) {
      throw new Error(`Unknown key "${key}" not found in schema`);
    }

    return _.get(this._keys, key).toJoi();
  }

  toJSON(): Object {
    return _.mapValues(this._keys, (datatype) => datatype.toJSON());
  }

}

export default Schema;
