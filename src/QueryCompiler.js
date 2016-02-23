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
   * Compiles and returns a selection expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileSelectionClause(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a projection expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileProjectionClause(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns an orderby expression, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileOrderByClause(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a "find" query, based on the supplied properties.
   * @param {Object} props query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileFindQuery(props: Object) {
    if (!_.isPlainObject(props)) {
      throw new TypeError(`Invalid props argument; expected object, received ${type(props)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a "count" query, based on the supplied properties.
   * @param {Object} props query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileCountQuery(props: Object) {
    if (!_.isPlainObject(props)) {
      throw new TypeError(`Invalid props argument; expected object, received ${type(props)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a "remove" query, based on the supplied properties.
   * @param {Object} props query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileRemoveQuery(props: Object) {
    if (!_.isPlainObject(props)) {
      throw new TypeError(`Invalid props argument; expected object, received ${type(props)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns an "insert" query, based on the supplied properties.
   * @param {Object} props query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileInsertQuery(props: Object) {
    if (!_.isPlainObject(props)) {
      throw new TypeError(`Invalid props argument; expected object, received ${type(props)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns an "upsert" query, based on the supplied properties.
   * @param {Object} props query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileUpsertQuery(props: Object) {
    if (!_.isPlainObject(props)) {
      throw new TypeError(`Invalid props argument; expected object, received ${type(props)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns an "update" query, based on the supplied properties.
   * @param {Object} props query properties.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileUpdateQuery(props: Object) {
    if (!_.isPlainObject(props)) {
      throw new TypeError(`Invalid props argument; expected object, received ${type(props)}`);
    }

    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

}

export default QueryCompiler;
