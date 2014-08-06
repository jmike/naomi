var Database = require('./Database'),
  MySQLEngine = require('./mysql/Engine');

// type constants
exports.MYSQL = 'MYSQL';
exports.POSTGRES = 'POSTGRES';

/**
 * Creates and returns a new database of the designated type.
 * Please note that various additional options may apply depending on the type of the database.
 * @see {@link https://github.com/felixge/node-mysql#connection-options} for MySQL additional options.
 * @see {@link https://github.com/brianc/node-postgres/wiki/Client#constructor} for Postgres additional options.
 * @param {String} type the database type, i.e. 'MYSQL', 'POSTGRES'.
 * @param {Object} options connection properties.
 * @param {String} options.host the hostname of the database.
 * @param {String|Number} options.port the port number of the database.
 * @param {String} options.user the user to authenticate to the database.
 * @param {String} options.password the password of the user.
 * @param {String} options.database the name of the database, a.k.a. the schema.
 * @returns {Database}
 * @throws {Error} if database type is invalid of unspecified.
 * @static
 */
exports.create = function (type, options) {
  var engine;

  if (type === this.MYSQL) {
    engine = new MySQLEngine(options);
    return new Database(engine);
  }

  if (type === this.POSTGRES) {
    throw new Error('Postgres database not yet supported');
  }

  throw new Error('Invalid or unspecified database type');
};
