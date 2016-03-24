import _ from 'lodash';
import Database from './Database';

class Naomi {

  constructor() {
    this._engines = [];
  }

  /**
   * Registers the given database engine under the designated identifier.
   * @param {String} id database engine identifier, e.g. "mysql", "postgres"
   * @param {Database} engine the database engine itself.
   * @throws {TypeError} if params are invalid or unspecified.
   * @returns {Naomi}
   */
  registerDatabaseEngine(id: string, engine: Class<Database>): Naomi {
    this._engines.push({
      id: id,
      re: new RegExp(id, 'i'),
      Database: engine
    });

    return this;
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
  database(id: string, connectionProperties: ?Object): Database {
    // handle optional params
    connectionProperties = connectionProperties || {};

    // find engine by id
    const engine = _.find(this._engines, (e) => e.re.test(id));

    // create + return new db
    if (engine) {
      return new engine.Database(connectionProperties);
    }

    throw new TypeError(`Unknown database engine; please specify one of ${this._engines.map((e) => e.id).join(', ')}`);
  }

}

export default new Naomi(); // singleton
