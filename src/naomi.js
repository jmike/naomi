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
 * @param {string} type the database type, i.e. "mysql", "postgres".
 * @param {object} [props] connection properties.
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
