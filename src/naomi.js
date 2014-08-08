var Database = require('./Database'),
  MySQLEngine = require('./MySQLEngine'),
  PostgresEngine = require('./PostgresEngine');

/**
 * Creates and returns a new database of the designated type.
 * Please note that additional connection options may apply depending on the database type.
 * @see {@link https://github.com/felixge/node-mysql#connection-options} for MySQL options.
 * @see {@link https://github.com/brianc/node-postgres/wiki/Client#constructor} for Postgres options.
 * @param {String} type the database type, i.e. 'mysql', 'postgres'.
 * @param {Object} [options] connection options.
 * @param {String} options.host the hostname of the database.
 * @param {String|Number} options.port the port number of the database.
 * @param {String} options.user the user to authenticate to the database.
 * @param {String} options.password the password of the user.
 * @param {String} options.database the name of the database.
 * @returns {Database}
 * @throws {Error} if database type is invalid of unspecified.
 * @static
 */
exports.create = function (type, options) {
  var engine;

  if (/mysql/i.test(type)) {
    engine = new MySQLEngine(options);
    return new Database(engine);
  }

  if (/postgres/i.test(type)) {
    engine = new PostgresEngine(options);
    return new Database(engine);
  }

  throw new Error('Invalid or unspecified database type');
};
