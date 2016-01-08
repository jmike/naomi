import CustomError from 'customerror';
import Collection from './Collection';
import Database from './Database';

class QueryBuilder {

  /**
   * Constructs a new QueryBuilder instance for the designated collection.
   * @param {string} collectionName the name of the collection.
   * @constructor
   */
  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Builds and returns a new "find" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildFind(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "find one" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildFindOne(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "count" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildCount(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "remove" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildRemove(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "insert" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildInsert(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Builds and returns a new "update" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  buildUpdate(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

}

export default QueryBuilder;
