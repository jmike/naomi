const {EventEmitter} = require('events');
const Promise = require('bluebird');
const _ = require('lodash');

class Collection extends EventEmitter {

  /**
   * Constructs a new Collection instance.
   * @param {Database} db reference to the parent database.
   * @param {string} name the name of the collection.
   * @param {Object} [schema] the schema of the collection.
   * @throws {TypeError} if arguments are of invalid type
   * @constructor
   */
  constructor(db: Object, name: string, schema: ?Object) {
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
    this.schema = schema;
  }

  /**
   * Reverse engineers the collection's schema from metadata retreived from the database.
   * This function will update the collection's schema.
   * @param {Function<Error>} [callback] an optional callback function
   * @return {Promise}
   */
  reverseEngineer(callback: ?Function): Promise {
    return Promise.resolve().nodeify(callback);
  }

  /**
   * Registers the collection to the database, e.g. creates table in MySQL.
   * @param {string} [name] optional collection name to register in database
   * @param {Function<Error>} [callback] an optional callback function
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
   * Retrieves an array of records from the collection based on the given query.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [$query] a naomi query object
   * @param {Function<Error, Array<Object>>} [callback] an optional callback function
   * @returns {Promise<Array<Object>>} a bluebird promise resolving to an array of records
   * @throws {TypeError} if arguments are of invalid type
   */
  find($query: boolean | number | string | ?Object, callback: ?Function): Promise {
    // validate arguments
    if (_.isNull($query)) {
      throw new TypeError('Invalid $query argument; null is not allowed');
    }

    // handle optional arguments
    if (_.isFunction($query)) {
      callback = $query;
      $query = undefined;
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Retrieves a single record from the collection based on the given query.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [$query] a naomi query object
   * @param {Function<Error, Object>} [callback] an optional callback function
   * @returns {Promise<Object>} a bluebird promise resolving to a single record
   * @throws {TypeError} if arguments are of invalid type
   */
  findOne($query: boolean | number | string | ?Object, callback: ?Function): Promise {
    // validate arguments
    if (_.isNull($query)) {
      throw new TypeError('Invalid $query argument; null is not allowed');
    }

    // handle optional arguments
    if (_.isFunction($query)) {
      callback = $query;
      $query = undefined;
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Counts records in the collection based on the given query.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [$query] a naomi query object
   * @param {Function<Error, number>} [callback] an optional callback function
   * @returns {Promise<number>} a bluebird promise resolving to the number of records
   * @throws {TypeError} if arguments are of invalid type
   */
  count($query: boolean | number | string | ?Object, callback: ?Function): Promise {
    // validate arguments
    if (_.isNull($query)) {
      throw new TypeError('Invalid $query argument; null is not allowed');
    }

    // handle optional arguments
    if (_.isFunction($query)) {
      callback = $query;
      $query = undefined;
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Removes records from the collection based on the given query.
   * @param {(boolean|number|string|Date|Object|Array<Object>)} [$query] a naomi query object
   * @param {Function<Error>} [callback] an optional callback function
   * @returns {Promise>} a bluebird promise
   * @throws {TypeError} if arguments are of invalid type
   */
  remove($query: boolean | number | string | ?Object, callback: ?Function): Promise {
    // validate arguments
    if (_.isNull($query)) {
      throw new TypeError('Invalid $query argument; null is not allowed');
    }

    // handle optional arguments
    if (_.isFunction($query)) {
      callback = $query;
      $query = undefined;
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Inserts the specified record(s) to the collection.
   * @param {(Object|Array<Object>)} records the record(s) to insert to the collection
   * @param {Object} [options] optional query options
   * @param {Function<err, Object>} [callback] an optional callback function with (err, keys) argument
   * @returns {Promise} a bluebird promise resolving to the primary key of the created record(s).
   * @throws {TypeError} if arguments are of invalid type
   */
  insert(records: Object | Array, options: ?Object, callback: ?Function): Promise {
    // handle optional arguments
    options = options || {};

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    return Promise.resolve().nodeify(callback);
  }

  /**
   * Creates or updates (if already exist) the specified record(s) in table.
   * @param {(Object|Array<Object>)} records the record(s) to insert to the collection
   * @param {Object} [options] optional query options
   * @param {Function<err, Object>} [callback] an optional callback function with (err, keys) argument
   * @returns {Promise} a bluebird promise resolving to the primary key of the created/updated record(s)
   * @throws {TypeError} if arguments are of invalid type
   */
  update(records: Object | Array, options: ?Object, callback: ?Function): Promise {
    // handle optional arguments
    options = options || {};

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    return Promise.resolve().nodeify(callback);
  }

}

module.exports = Collection;
