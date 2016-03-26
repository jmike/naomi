import _ from 'lodash';
import type from 'type-of';
import Database from './Database';

function constructNaomi() {
  let engines = [];

  /**
   * Registers the given database engine under the designated identifier.
   * @param {String} id database engine identifier, e.g. "mysql", "postgres"
   * @param {Database} engine the database engine itself.
   * @throws {TypeError} if params are invalid or unspecified.
   */
  function registerDatabaseEngine(id, engine) {
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
  function createDatabase(id: string, connectionProperties: ?Object): Database {
    if (!_.isString(id)) {
      throw new TypeError(`Invalid id variable; expected string, received ${type(id)}`);
    }

    // handle optional params
    connectionProperties = connectionProperties || {};

    // find engine by id
    const engine = _.find(engines, (e) => e.re.test(id));

    // create + return new db
    if (engine) {
      return new engine.Database(connectionProperties);
    }

    throw new TypeError(`Unknown database engine; please specify one of ${engines.map((e) => e.id).join(', ')}`);
  }

  // expose public API
  return Object.freeze({
    registerDatabaseEngine,
    database: createDatabase,
    create: createDatabase,
  });
}

export default constructNaomi(); // singleton
