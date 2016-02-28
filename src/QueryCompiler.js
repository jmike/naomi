import _ from 'lodash';
import type from 'type-of';
import CustomError from 'customerror';
import Schema from './Schema';

class QueryCompiler {

  /**
   * Constructs a new QueryCompiler instance for the designated collection.
   * @param {string} name the name of the collection.
   * @param {Schema} schema the schema of the collection.
   * @constructor
   */
  constructor(name: string, schema: Schema) {
    this.name = name;
    this.schema = schema;
  }

  /**
   * Compiles and returns a "find" query.
   * @param {Object} $query query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileFindQuery($query: Object) {
    if (!_.isPlainObject($query)) {
      throw new TypeError(`Invalid $query argument; expected object, received ${type($query)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a "count" query.
   * @param {Object} $query query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileCountQuery($query: Object) {
    if (!_.isPlainObject($query)) {
      throw new TypeError(`Invalid $query argument; expected object, received ${type($query)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a "remove" query.
   * @param {Object} $query query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileRemoveQuery($query: Object) {
    if (!_.isPlainObject($query)) {
      throw new TypeError(`Invalid $query argument; expected object, received ${type($query)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns an "insert" query.
   * @param {Object} $query query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileInsertQuery($query: Object) {
    if (!_.isPlainObject($query)) {
      throw new TypeError(`Invalid $query argument; expected object, received ${type($query)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns an "upsert" query.
   * @param {Object} $query query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileUpsertQuery($query: Object) {
    if (!_.isPlainObject($query)) {
      throw new TypeError(`Invalid $query argument; expected object, received ${type($query)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns an "update" query.
   * @param {Object} $query query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileUpdateQuery($query: Object) {
    if (!_.isPlainObject($query)) {
      throw new TypeError(`Invalid $query argument; expected object, received ${type($query)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

}

export default QueryCompiler;
