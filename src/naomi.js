import _ from 'lodash';
import type from 'type-of';

function constructNaomi() {
  const engines = [];

  function register(identifier, engine) {
    if (!_.isString(identifier)) {
      throw new TypeError(`Invalid identifier argument; expected string, received ${type(identifier)}`);
    }

    engines.push({
      re: new RegExp(identifier, 'i'),
      Database: engine
    });
  }

  function create(identifier, connectionProperties = {}) {
    if (!_.isString(identifier)) {
      throw new TypeError(`Invalid identifier argument; expected string, received ${type(identifier)}`);
    }

    if (!_.isPlainObject(connectionProperties)) {
      throw new TypeError('Invalid connectionProperties argument; ' +
        `expected object, received ${type(connectionProperties)}`);
    }

    // find engine by id
    const engine = _.find(engines, (e) => e.re.test(identifier));

    // create + return new db
    if (engine) {
      return new engine.Database(connectionProperties);
    }

    throw new Error(`Unknown database engine "${identifier}"`);
  }

  // expose public API
  return Object.freeze({
    register,
    create,
    database: create, // alias of create
  });
}

export default constructNaomi(); // singleton
