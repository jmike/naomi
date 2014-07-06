var Database = require('./Database'),
  MySQLEngine = require('./mysql/Engine');

// type constants
exports.MYSQL = 'MYSQL';
exports.POSTGRES = 'POSTGRES';

/**
 * Creates and returns a new database of the specified type.
 * @param {String} type the database type.
 * @param {Object} connectionProperties connection properties.
 * @static
 */
exports.create = function (type, connectionProperties) {
  var engine;

  switch (type) {
    case this.MYSQL:
      engine = new MySQLEngine(connectionProperties);
      return new Database(engine);

    case this.POSTGRES:
      throw new Error('Naomi: Postgres database not yet supported');

    default:
      throw new Error('Naomi: Invalid or unspecified database type');
  }
};
