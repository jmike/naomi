var MySQLDatabase = require('./mysql/Database'),
  PostgresDatabase = require('./postgres/Database');

require('dotenv').load(); // load environmental variables

/**
 * Creates and returns a new database of the designated type.
 * Please note: additional connection properties may apply depending on the database type.
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
 * @throws {Error} if params are invalid of unspecified.
 * @static
 */
exports.create = function (type, props) {
  props = props || {};

  if (/mysql/i.test(type)) {
    return new MySQLDatabase({
      host: props.host || process.env.MYSQL_HOST || 'localhost',
      port: props.port || parseInt(process.env.MYSQL_PORT, 10) || 3306,
      user: props.user || process.env.MYSQL_USER || 'root',
      password: props.password || process.env.MYSQL_PASSWORD || '',
      database: props.database || process.env.MYSQL_DATABASE || null,
      connectionLimit: props.connectionLimit || props.poolSize || 10 // connectionLimit used to be poolSize
    });
  }

  if (/postgres/i.test(type)) {
    return new PostgresDatabase({
      host: props.host || process.env.POSTGRES_HOST || 'localhost',
      port: props.port || parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      user: props.user || process.env.POSTGRES_USER || 'root',
      password: props.password || process.env.POSTGRES_PASSWORD || '',
      database: props.database || process.env.POSTGRES_DATABASE || null,
      connectionLimit: props.connectionLimit || props.poolSize || 10, // connectionLimit used to be poolSize
      poolIdleTimeout: 30000,
      reapIntervalMillis: 1000
    });
  }

  throw new Error('Invalid database type: expected "mysql" or "postgres", received "' + type + '"');
};
