import _ from 'lodash';
import type from 'type-of';
import CustomError from 'customerror';
import Database from './Database'; // eslint-disable-line
import Schema from './Schema';
import parseSelection from './queryparsers/selection';
import parseProjection from './queryparsers/projection';
import parseOrderBy from './queryparsers/orderBy';
import parseLimit from './queryparsers/limit';
import parseOffset from './queryparsers/offset';

class Collection {

  /**
   * Constructs a new Collection instance.
   * @param {Database} db reference to the parent database.
   * @param {string} name the name of the collection.
   * @param {(Object, Schema)} [schema] the schema definition of the collection.
   * @throws {TypeError} if arguments are of invalid type
   * @constructor
   */
  constructor(db: Database, name: string, schema: Schema | ?Object) {
    this.db = db;
    this.name = name;

    if (schema instanceof Schema) {
      this.schema = schema;
    } else if (_.isPlainObject(schema)) {
      this.schema = new Schema(schema);
    } else if (_.isUndefined(schema)) {
      this.schema = new Schema({});
    } else {
      throw new TypeError(`Invalid schema argument; expected object or Schema, received ${type(schema)}`);
    }

    this.parseSelection = parseSelection;
    this.parseProjection = parseProjection;
    this.parseOrderBy = parseOrderBy;
    this.parseLimit = parseLimit;
    this.parseOffset = parseOffset;
  }

  /**
   * Creates the specified index in the collection.
   * @param {Object} payload key-value pairs, where key represent some keys of this schema and value describes the type of the index, i.e. 1 for ASC, -1 for DESC.
   * @param {Object} [options] index options.
   * @param {string} [options.name] the name of the index.
   * @param {string} [options.type="index"] the type of the index, i.e. "primary", "unique" or "index".
   * @throws {TypeError} if arguments are invalid.
   * @returns {Collection} this collection to allow method chaining.
   */
  index(payload: Object, options: ?{name: ?string, type: ?string}): Collection {
    this.schema.index(payload, options);
    return this;
  }

  /**
   * Extracts and returns keys from the supplied AST.
   * @param {Array} ast
   * @returns {Array<string>}
   */
  extractKeysFromAST(ast: Array): Array<string> {
    let keys = [];

    if (ast[0] === 'KEY') {
      keys.push(ast[1]);
    } else {
      ast.forEach((e) => {
        if (_.isArray(e)) {
          const arr = this.extractKeysFromAST(e);

          if (arr.length !== 0) {
            keys = keys.concat(arr);
          }
        }
      });
    }

    return keys;
  }

  /**
   * Checks if keys in the supplied AST exist in the collection schema.
   * @param {Array} ast
   * @return {Array}
   * @throws {UnknownKey} if key does not exist in the collection schema.
   */
  validateKeysInAST(ast: Array): Array {
    const keys = this.extractKeysFromAST(ast);

    // make sure selection keys exist in schema
    keys.forEach((k) => {
      if (!this.schema.hasKey(k)) {
        throw new CustomError(`Unknown key "${k}" not found in ${this.name} collection`, 'UnknownKey');
      }
    });

    return ast;
  }
}

export default Collection;
