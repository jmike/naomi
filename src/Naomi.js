const _ = require('lodash');
const type = require('type-of');
const CustomError = require('customerror');

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
   * @throws {InvalidArgument} if params are invalid or unspecified
   */
  registerEngine(id, engine) {
    // validate params
    if (!_.isString(id)) {
      throw new CustomError(`Invalid id argument; expected string, received ${type(id)}`, 'InvalidArgument');
    }

    this._engines.push({
      re: new RegExp(id, 'i'),
      Database: engine
    });
  }

  /**
   * Creates and returns a new Database of the designated type.
   * Please note: connection properties may vary depending on the database type.
   * @param {String} id database engine identifier, e.g. "mysql", "postgres"
   * @param {Object} [props={}] connection properties
   * @throws {InvalidArgument} if params are invalid or unspecified
   * @returns {Database}
   */
  create(id, props = {}) {
    // validate params
    if (!_.isString(id)) {
      throw new CustomError(`Invalid id argument; expected string, received ${type(id)}`, 'InvalidArgument');
    }

    if (!_.isPlainObject(props)) {
      throw new CustomError(`Invalid props argument; expected object, received ${type(props)}`, 'InvalidArgument');
    }

    // create and return db
    const engine = _.find(this._engines, (e) => e.re.test(id));

    if (engine) {
      return new engine.Database(props);
    }

    throw new CustomError(`Unknown engine argument; please specify one of "mysql" or "postgres"`, 'InvalidArgument');
  }

}

module.exports = new Naomi();
