require('dotenv').load(); // load environmental variables

var _ = require('lodash');
var type = require('type-of');
var MySQLDatabase = require('./mysql/Database');
var PostgresDatabase = require('./postgres/Database');

var mysqlRegex = /mysql/i;
var postgresRegex = /postgres|pg/i;

/**
 * Creates and returns a new Database of the designated type.
 * Please note: connection properties may vary depending on the database type.
 * @param {string} engine the database engine, i.e. "mysql", "postgres".
 * @param {object} [props] connection properties.
 * @throws {Error} if params are invalid or unspecified.
 * @returns {Database}
 * @static
 */
exports.create = function (engine, props) {
  // validate engine argument
  if (!_.isString(engine)) {
    throw new Error('Invalid engine argument; expected string, received ' + type(engine));
  }

  // handle optional props
  if (_.isUndefined(props)) {
    props = {};
  }

  // validate props argument
  if (!_.isPlainObject(props)) {
    throw new Error('Invalid props argument; expected object, received ' + type(props));
  }

  // create and return db
  if (mysqlRegex.test(engine)) {
    props = _.defaults(props, {
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT, 10),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });

    return new MySQLDatabase(props);
  }

  if (postgresRegex.test(engine)) {
    props = _.defaults(props, {
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE
    });

    return new PostgresDatabase(props);
  }

  throw new Error('Unknown engine; please specify one of "mysql" or "postgres"');
};
