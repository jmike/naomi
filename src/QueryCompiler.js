import CustomError from 'customerror';
import Collection from './Collection';

class QueryCompiler {

  /**
   * Constructs a new QueryCompiler instance for the designated collection.
   * @param {string} collection the collection to compile queries for.
   * @constructor
   */
  constructor(collection: string) {
    this.collection = collection;
  }

  /**
   * Compiles and returns a selection clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileSelection(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a projection clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileProjection(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns an orderby clause, based on the supplied AST.
   * @param {Array} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileOrderBy(ast: Array) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a new "find" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileFind(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a new "count" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileCount(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a new "remove" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileRemove(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a new "insert" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileInsert(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

  /**
   * Compiles and returns a new "update" query, based on the supplied AST.
   * @param {Object} ast abstract syntax tree.
   * @return {Object}
   * @throws {NotImplementedException} if method has not been implemented or does not apply to the current database engine.
   */
  compileUpdate(ast: Object) {
    throw new CustomError('Method not implemented', 'NotImplementedException');
  }

}

export default QueryCompiler;
