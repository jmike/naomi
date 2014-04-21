var MySQLDatabase = require('./mysql/Database');

module.exports = {

  // db type constants
  MYSQL: 'MYSQL',
  POSTGRES: 'POSTGRES',

  /**
   * Creates and returns a new database of the specified type.
   * @param {String} type the database type.
   * @param {Object} connectionProperties connection properties.
   * @see https://github.com/felixge/node-mysql#connection-options for a list of MySQL connection properties.
   * @static
   */
  create: function (type, connectionProperties) {
    switch (type) {
    case this.MYSQL:
      return new MySQLDatabase(connectionProperties);
    case this.POSTGRES:
      throw new Error('Naomi: Postgres database not yet supported');
    default:
      throw new Error('Naomi: Invalid or unspecified database type');
    }
  }
};
