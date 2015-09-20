import _ from 'lodash';
import type from 'type-of';
import MySQLDatabase from './mysql/Database';
import PgDatabase from './postgres/Database';
import CustomError from 'customerror';

const reMySQL = /mysql/i;
const rePg = /postgres|pg/i;

class Naomi {

  /**
   * Creates and returns a new Database of the designated type.
   * Please note: connection properties may vary depending on the database type.
   * @param {String} engine the database engine, i.e. "mysql", "postgres"
   * @param {Object} [props={}] connection properties
   * @throws {Error} if params are invalid or unspecified
   * @returns {Database}
   * @static
   */
  static create(engine, props = {}) {
    // validate params
    if (!_.isString(engine)) {
      throw new CustomError(`Invalid engine argument; expected string, received #{type(engine)}`, 'InvalidArgument');
    }

    if (!_.isPlainObject(props)) {
      throw new CustomError(`Invalid props argument; expected object, received ${type(props)}`, 'InvalidArgument');
    }

    // create and return db
    if (reMySQL.test(engine)) {
      props = _.defaults(props, {
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT, 10),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
      });

      return new MySQLDatabase(props);
    }

    if (rePg.test(engine)) {
      props = _.defaults(props, {
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT, 10),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE
      });

      return new PgDatabase(props);
    }

    throw new CustomError(`Unknown engine argument; please specify one of "mysql" or "postgres"`, 'InvalidArgument');
  }

}

export default Naomi;
