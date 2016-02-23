import {EventEmitter} from 'events';
import Promise from 'bluebird';
import _ from 'lodash';
import type from 'type-of';
import Database from './Database';
import Schema from './Schema';
import QueryParser from './QueryParser';
import QueryCompiler from './QueryCompiler';

class Collection extends EventEmitter {

  /**
   * Constructs a new Collection instance.
   * @param {Database} db reference to the parent database.
   * @param {string} name the name of the collection.
   * @param {Object} [schema] the schema definition of the collection.
   * @throws {TypeError} if arguments are of invalid type
   * @constructor
   */
  constructor(db: Database, name: string, schema: ?Object) {
    // setup EventEmitter
    super();
    this.setMaxListeners(999);

    // validate arguments
    if (_.isNull(schema)) {
      throw new TypeError('Invalid schema argument; null is not allowed');
    }

    // handle optional arguments
    schema = schema || {};

    this.db = db;
    this.name = name;
    this.schema = new Schema(schema);
    this.parser = new Collection.QueryParser(this.name, this.schema);
    this.compiler = new Collection.QueryCompiler(this.name, this.schema);
  }

  /**
   * Reverse engineers the collection's schema from metadata retrieved from the database.
   * This function will update the collection's schema.
   * @param {Function<Error>} [callback] an optional callback function.
   * @return {Promise}
   */
  reverseEngineer(callback: ?Function): Promise {
    return Promise.resolve().nodeify(callback);
  }

  /**
   * Registers the collection to the database, e.g. creates table in MySQL.
   * @param {string} [name] optional collection name to register in database.
   * @param {Function<Error>} [callback] an optional callback function.
   * @return {Promise}
   */
  register(name: string | ?Function, callback: ?Function): Promise {
    // validate arguments
    if (_.isNull(name)) {
      throw new TypeError('Invalid name argument; null is not allowed');
    }

    // handle optional arguments
    if (_.isFunction(name)) {
      callback = name;
      name = undefined;
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Retrieves an array of records from the collection based on the given selection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [selection] a naomi selection expression.
   * @param {Object} [options] §§§§query options.
   * @param {Function<Error, Array<Object>>} [callback] an optional callback function.
   * @returns {Promise<Array<Object>>} a bluebird promise resolving to an array of records.
   * @throws {TypeError} if arguments are of invalid type.
   */
  find(selection: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction(selection)) {
      callback = selection;
      selection = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    // return {
    //   selection: this.parseSelection(_.omit(query, ['$projection', '$orderby', '$limit', '$offset'])),
    //   projection: this.parseProjection(query.$projection),
    //   orderby: this.parseOrderBy(query.$orderby),
    //   limit: this.parseLimit(query.$limit),
    //   offset: this.parseOffset(query.$offset),
    // };
    return Promise.resolve().nodeify(callback);
  }

  /**
   * Retrieves a single record from the collection based on the given selection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [selection] an optional naomi selection expression.
   * @param {Object} [options] §§§§query options.
   * @param {Function<Error, Object>} [callback] an optional callback function
   * @returns {Promise<Object>} a bluebird promise resolving to a single record.
   * @throws {TypeError} if arguments are of invalid type.
   */
  findOne(selection: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction(selection)) {
      callback = selection;
      selection = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Counts records in the collection based on the given selection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [selection] a naomi selection expression.
   * @param {Object} [options] §§§§query options.
   * @param {Function<Error, number>} [callback] an optional callback function.
   * @returns {Promise<number>} a bluebird promise resolving to the number of records.
   * @throws {TypeError} if arguments are of invalid type.
   */
  count(selection: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction(selection)) {
      callback = selection;
      selection = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Removes records from the collection based on the given selection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [selection] an optional naomi selection expression.
   * @param {Function<Error>} [callback] an optional callback function.
   * @returns {Promise>} a bluebird promise.
   * @throws {TypeError} if arguments are of invalid type.
   */
  remove(selection: boolean | number | string | Object | ?Function, options: Object | ?Function, callback: ?Function): Promise {
    // handle optional arguments
    if (_.isFunction(selection)) {
      callback = selection;
      selection = undefined;
      options = {};
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Creates the specified record(s) in the collection.
   * @param {(Object|Array<Object>)} records the record(s) to insert to the collection.
   * @param {Object} [options] §§§§query options.
   * @param {Function<err, Object>} [callback] an optional callback function with (err, keys) argument.
   * @returns {Promise} a bluebird promise resolving to the primary key of the created record(s).
   * @throws {TypeError} if arguments are of invalid type.
   */
  insert(records: Object, options: Object | ?Function, callback: ?Function): Promise {
    // validate arguments
    if (!_.isPlainObject(records) && !_.isArray(records)) {
      throw new TypeError(`Invalid records argument; exprected object or array, received ${type(records)}`);
    }

    // handle optional arguments
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Creates, or updates if they already exist, the specified record(s) in the collection.
   * @param {(Object|Array<Object>)} records the record(s) to insert to the collection.
   * @param {Object} [options] §§§§query options.
   * @param {Function<err, Object>} [callback] an optional callback function with (err, keys) argument.
   * @returns {Promise} a bluebird promise resolving to the primary key of the created record(s).
   * @throws {TypeError} if arguments are of invalid type.
   */
  upsert(records: Object, options: Object | ?Function, callback: ?Function): Promise {
    // validate arguments
    if (!_.isPlainObject(records) && !_.isArray(records)) {
      throw new TypeError(`Invalid records argument; exprected object or array, received ${type(records)}`);
    }

    // handle optional arguments
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Updates (if already exist) the specified record(s) in the collection.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} selection a naomi selection expression.
   * @param {(Object|Array<Object>)} records the record(s) to insert to the collection.
   * @param {Object} [options] §§§§query options.
   * @param {Function<err, Object>} [callback] an optional callback function with (err, keys) argument.
   * @returns {Promise} a bluebird promise resolving to the primary key of the created/updated record(s).
   * @throws {TypeError} if arguments are of invalid type.
   */
  update(selection: boolean | number | string | ?Object, records: Object | Array, options: ?Object, callback: ?Function): Promise {
    // validate arguments
    if (!_.isPlainObject(records) && !_.isArray(records)) {
      throw new TypeError(`Invalid records argument; exprected object or array, received ${type(records)}`);
    }

    // handle optional arguments
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    return Promise.resolve().nodeify(callback);
  }

}

export default Collection;
