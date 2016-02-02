import CustomError from 'customerror';
import Collection from './Collection';

class QueryBuilder {

  /**
   * Constructs a new QueryBuilder instance for the designated collection.
   * @param {Collection} collection the collection to build queries for.
   * @constructor
   */
  constructor(collection: Collection) {
    this.collection = collection;
  }

  /**
   * Builds and returns a selection clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildSelectionClause(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a projection clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildProjectionClause(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns an orderby clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildOrderByClause(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "find" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildFindQuery(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "count" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildCountQuery(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "remove" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildRemoveQuery(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "insert" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildInsertQuery(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "update" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildUpdateQuery(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

}

export default QueryBuilder;
