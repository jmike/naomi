require('dotenv').load(); // load environmental variables

var Joi = require('joi');
var _ = require('lodash');
var MySQLDatabase = require('./mysql/Database');
var PostgresDatabase = require('./postgres/Database');

var typeSchema = Joi.string()
  .strict()
  .required()
  .label('database type')
  .valid(['mysql', 'postgres'])
  .insensitive();

/**
 * Creates and returns a new Database instance of the designated type.
 * Please note: connection properties may vary depending on the database type.
 * @see {@link https://github.com/felixge/node-mysql#connection-options} for MySQL additional properties.
 * @see {@link https://github.com/brianc/node-postgres/wiki/Client#constructor} for Postgres additional properties.
 * @param {string} type the database type, i.e. "mysql", "postgres".
 * @param {object} [props] connection properties.
 * @param {string} [props.host] the hostname of the database.
 * @param {(string|number)} [props.port] the port number of the database.
 * @param {string} [props.user] the user to access the database.
 * @param {string} [props.password] the password of the user.
 * @param {string} [props.database] the name of the database.
 * @param {number} [props.connectionLimit=10] number maximum number of connections to maintain in the pool.
 * @throws {Error} if params are invalid or unspecified.
 * @returns {Database}
 * @static
 */
exports.create = function (type, props) {
  var validationResult;

  // validate db type
  validationResult = Joi.validate(type, typeSchema);

  if (validationResult.error) throw validationResult.error;
  type = validationResult.value;

  // handle optional connection properties
  props = props || {};

  // contruct and return db
  if (type === 'mysql') {
    return new MySQLDatabase(_.defaults(props, {
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT, 10),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    }));
  }

  return new PostgresDatabase(_.defaults(props, {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
  }));
};
