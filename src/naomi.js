import _ from 'lodash';
import type from 'type-of';
import Database from './Database';

function constructNaomi() {
  let engines = [];

  /**
   * Registers the supplied database engine under the designated identifier.
   * @param {String} id database engine identifier, e.g. "mysql", "postgres"
   * @param {Database} engine the database engine itself.
   * @throws {TypeError} if params are invalid or unspecified.
   */
  function register(id, engine) {
    if (!_.isString(id)) {
      throw new TypeError(`Invalid id variable; expected string, received ${type(id)}`);
    }

    engines.push({
      id: id,
      re: new RegExp(id, 'i'),
      Database: engine
    });
  }

  /**
   * Creates and returns a new Database of the designated type.
   * Please note: connection properties may vary depending on the database type.
   * @param {String} id database engine identifier, e.g. "mysql", "postgres"
   * @param {Object} [connectionProperties={}] connection properties
   * @throws {TypeError} if params are invalid or unspecified.
   * @throws {UnknownDatabaseEngine} if the specified engine identifier is unknown to Naomi.
   * @returns {Database}
   */
  function create(id, connectionProperties = {}) {
    if (!_.isString(id)) {
      throw new TypeError(`Invalid id variable; expected string, received ${type(id)}`);
    }

    if (!_.isPlainObject(connectionProperties)) {
      throw new TypeError(`Invalid connectionProperties variable; expected plain Object, received ${type(id)}`);
    }

    // find engine by id
    const engine = _.find(engines, (e) => e.re.test(id));

    // create + return new db
    if (engine) {
      return new engine.Database(connectionProperties);
    }

    throw new Error(`Unknown database engine "${id}"`);
  }

  // expose public API
  return Object.freeze({
    register,
    create,
    database: create,
  });
}

export default constructNaomi(); // singleton
