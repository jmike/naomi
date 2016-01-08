import CustomError from 'customerror';
import Collection from './Collection';
import Database from './Database';

class QueryBuilder {

  /**
   * Constructs a new QueryBuilder instance for the designated collection in db.
   * @param {Database} db: Database [description]
   * @param {Collection} collection: Collection [description]
   * @constructor
   */
  constructor(collection: Collection, db: Database) {
    this.collection = collection;
    this.db = db;
  }

  /**
   * Builds and returns a new "find" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   */
  buildFind(ast: Array): Object {
    throw new CustomError('Method not implemented', 'NotImplemented');
  }

  /**
   * Builds and returns a new "find one" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   */
  buildFindOne(ast: Array): Object {
    throw new CustomError('Method not implemented', 'NotImplemented');
  }

  /**
   * Builds and returns a new "count" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   */
  buildCount(ast: Array): Object {
    throw new CustomError('Method not implemented', 'NotImplemented');
  }

  /**
   * Builds and returns a new "remove" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   */
  buildRemove(ast: Array): Object {
    throw new CustomError('Method not implemented', 'NotImplemented');
  }

  /**
   * Builds and returns a new "insert" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   */
  buildInsert(ast: Array): Object {
    throw new CustomError('Method not implemented', 'NotImplemented');
  }

  /**
   * Builds and returns a new "update" query, based on the supplied AST.
   * @param {Array} ast an abstract syntax tree, as provided by the QueryParser.
   * @return {Object}
   */
  buildUpdate(ast: Array): Object {
    throw new CustomError('Method not implemented', 'NotImplemented');
  }

}

export default QueryBuilder;
