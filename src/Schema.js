import _ from 'lodash';
import Promise from 'bluebird';
import Joi from 'joi';
import type from 'type-of';
import CustomError from 'customerror';
import datatypes from './datatypes';

class Schema {

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

  extend(spec) {
    if (!_.isPlainObject(spec)) {
      throw new TypeError(`Invalid schema spec; expected plain object, received ${type(spec)}`);
    }

    _.forOwn(spec, (value, key) => {
      // make sure value is object
      if (!_.isPlainObject(value)) {
        throw new TypeError(`Invalid value for key "${key}" in schema spec; ` +
          `expected plain object, received ${type(value)}`);
      }

      // make sure value type is valid
      if (!datatypes.hasOwnProperty(value.type)) {
        throw new TypeError(`Unknown datatype "${value.type}" for key "${key}" in schema spec`);
      }

      // create datatype
      const datatype = new datatypes[value.type]();

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

  index(payload, options) {
    // make sure payload is plain object
    if (!_.isPlainObject(payload)) {
      throw new TypeError(`Invalid "payload" argument; expected plain object, received ${type(payload)}`);
    }

    // make sure payload is not empty
    if (_.isEmpty(payload)) {
      throw new TypeError('Invalid "payload" argument; object must not be empty');
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
        throw new TypeError(`Invalid order for key "${key}"; ` +
          `expected 1 (i.e. ASC) or -1 (i.e. DESC), received ${order}`);
      }
    });

    // handle optional arguments
    options = _.defaults(options, { type: 'index' });

    switch (options.type) {
      case 'index':
        if (_.isNil(options.name)) {
          options.name = `idx${_.size(this._indexKeys) + 1}`;
        }

        // make sure index is not already defined in unique indices
        if (_.has(this._uniqueKeys, options.name)) {
          throw new Error(`Index ${options.name} is already set as unique index in schema`);
        }

        this._indexKeys[options.name] = payload;
        break;

      case 'unique':
        if (_.isNil(options.name)) {
          options.name = `uidx${_.size(this._uniqueKeys) + 1}`;
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

  hasKey(key) {
    if (!_.isString(key)) {
      throw new TypeError(`Invalid key variable; expected string, received ${type(key)}`);
    }

    return _.has(this._keys, key);
  }

  getKeys() {
    return _.keys(this._keys);
  }

  getPrimaryKey() {
    return _.keys(this._primaryKey);
  }

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

  getIndexKey(name) {
    if (!_.isString(name)) {
      throw new TypeError(`Invalid name variable; expected string, received ${type(name)}`);
    }

    const obj = this._indexKeys[name];

    if (obj === undefined) {
      throw new Error(`Unknown index key "${name}" not found in schema`);
    }

    return _.keys(obj);
  }

  isKeyAutoInc(key) {
    if (!_.isString(key)) {
      throw new TypeError(`Invalid key variable; expected string, received ${type(key)}`);
    }

    if (!this.hasKey(key)) {
      throw new Error(`Unknown key "${key}" not found in schema`);
    }

    return _.get(this._keys, key).toJSON().autoinc === true;
  }

  isPrimaryKey(...keys) {
    if (keys.length === 0) {
      throw new TypeError('You must specify at least 1 key argument');
    }

    return _.chain(this._primaryKey).keys().xor(keys).size().value() === 0;
  }

  isUniqueKey(...keys) {
    if (keys.length === 0) {
      throw new TypeError('You must specify at least 1 key argument');
    }

    return _.some(this._uniqueKeys, (obj) => {
      return _.xor(_.keys(obj), keys).length === 0;
    });
  }

  isIndexKey(...keys) {
    if (keys.length === 0) {
      throw new TypeError('You must specify at least 1 key argument');
    }

    return _.some(this._indexKeys, (obj) => {
      return _.xor(_.keys(obj), keys).length === 0;
    });
  }

  hasAtomicPrimaryKey() {
    const keys = this.getPrimaryKey();
    return keys.length === 1;
  }

  hasAutoIncPrimaryKey() {
    const keys = this.getPrimaryKey();
    return keys.length === 1 && this.isKeyAutoInc(keys[0]);
  }

  _createJoi(keys) {
    const source = _.isArray(keys) ? _.pick(this._keys, keys) : this._keys;

    return Joi.object()
      .strict(true)
      .keys(_.mapValues(source, (datatype) => {
        return datatype.toJoi();
      }));
  }

  validate(record, keys, callback) {
    // validate record argument
    if (!_.isObject(record)) {
      throw new TypeError(`Invalid "record" argument; expected object, received ${type(record)}`);
    }

    // validate keys argument
    if (_.isFunction(keys)) {
      callback = keys;
      keys = this.getKeys();
    } else if (_.isUndefined(keys)) {
      keys = this.getKeys();
    } else if (!_.isArray(keys)) {
      throw new TypeError(`Invalid "keys" argument; expected array, received ${type(keys)}`);
    }

    // create Joi
    const joi = this._createJoi(keys);

    return new Promise((resolve, reject) => {
      Joi.validate(record, joi, { convert: false }, (err, value) => {
        if (err) {
          reject(new CustomError(err, 'ValidationError'));
          return; // exit
        }

        resolve(value);
      });
    }).nodeify(callback);
  }

  toJoi() {
    return this._createJoi();
  }

  toJSON() {
    return _.mapValues(this._keys, (datatype) => datatype.toJSON());
  }
}

export default Schema;
