const {EventEmitter} = require('events');
const Promise = require('bluebird');

class Database extends EventEmitter {

  /**
   * Creates a new Database instance with the designated properties.
   * @param {Object} connectionProperties connection properties
   * @throws {TypeError} If arguments are of invalid type
   * @constructor
   */
  constructor(connectionProperties: Object) {
    // setup EventEmitter
    super();
    this.setMaxListeners(999);

    this.connectionProperties = connectionProperties;
    this.isConnected = false;
  }

  /**
   * Connects to the database using the connection properties specified at construction time.
   * @param {Function<err>} [callback] an optional callback function.
   * @returns {Promise} a bluebird promise
   * @throws {TypeError} If arguments are of invalid type
   * @emits Database#connect
   */
  connect(callback: ?Function): Promise {
    // check if already connected
    if (this.isConnected) {
      return Promise.resolve().nodeify(callback);
    }

    // connect
    return Promise.resolve()
      .then(() => {
        this.isConnected = true;
        this.emit('connect');
      })
      .nodeify(callback);
  }

  /**
   * Disconnects from the database.
   * Please note: the database instance will become practically useless after calling this method.
   * @param {Function<Error>} [callback] an optional callback function.
   * @returns {Promise} a bluebird promise
   * @throws {TypeError} If arguments are of invalid type
   * @emits Database#disconnect
   */
  disconnect(callback: ?Function): Promise {
    // check if already disconnected
    if (!this.isConnected) {
      return Promise.resolve().nodeify(callback);
    }

    // define promise resolver
    // connect
    return Promise.resolve()
      .then(() => {
        this.isConnected = false;
        this.emit('disconnect');
      })
      .nodeify(callback);
  }

  /**
   * Runs the given parameterized SQL statement.
   * @param {string} sql the SQL statement.
   * @param {Array} [params] an array of parameter values.
   * @param {Object} [options] query options.
   * @param {Function} [callback] a callback function with (err, records) arguments.
   * @returns {Promise} a bluebird promise resolving to the query results.
   */
  query(sql: string, params: ?Array, options: ?Object, callback: ?Function): Promise {
    return Promise.resolve([{}]).nodeify(callback);
  }
}

module.exports = Database;
