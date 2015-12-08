const _ = require('lodash');
const type = require('type-of');
const CustomError = require('customerror');
const Database = require('./Database');

// register basic operators
require('./operators/and');
require('./operators/or');
require('./operators/eq');
require('./operators/ne');
require('./operators/gt');
require('./operators/gte');
require('./operators/lt');
require('./operators/lte');
require('./operators/like');
require('./operators/nlike');
require('./operators/in');
require('./operators/nin');

class Naomi {

  constructor() {
    this._engines = [];
  }

  /**
   * Registers the given naomi-compatible database engine under the designated identifier.
   * @param {String} id database engine identifier, e.g. "mysql", "postgres"
   * @param {Database} engine the database engine itself
   * @throws {TypeError} if params are invalid or unspecified
   */
  registerEngine(id: string, engine: Class<Database>) {
    this._engines.push({
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
  create(id: string, connectionProperties = {}: Object): Database {
    // create and return db
    const engine = _.find(this._engines, (e) => e.re.test(id));

    if (engine) {
      return new engine.Database(connectionProperties);
    }

    throw new CustomError(`Unknown engine argument; please specify one of ${this._engines.map((e) => e.id).join(', ')}`, 'UnknownDatabaseEngine');
  }

}

module.exports = new Naomi();
