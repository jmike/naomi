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

  constructor(db, name, schema) {
    if (!(db instanceof Database)) {
      throw new TypeError(`Invalid "db" argument; expected Database instance, received ${type(db)}`);
    }

    this.db = db;

    if (!_.isString(name)) {
      throw new TypeError(`Invalid "name" argument; expected string, received ${type(name)}`);
    }

    this.name = name;

    if (schema instanceof Schema) {
      this.schema = schema;
    } else if (_.isPlainObject(schema)) {
      this.schema = new Schema(schema);
    } else if (_.isUndefined(schema)) {
      this.schema = new Schema({});
    } else {
      throw new TypeError(`Invalid "schema" argument; expected Object or Schema, received ${type(schema)}`);
    }

    this.parseSelection = parseSelection;
    this.parseProjection = parseProjection;
    this.parseOrderBy = parseOrderBy;
    this.parseLimit = parseLimit;
    this.parseOffset = parseOffset;
  }

  index(payload, options = {}) {
    this.schema.index(payload, options);
    return this;
  }

  /**
   * Extracts and returns keys from the supplied AST.
   * @param {Array} ast
   * @returns {Array<string>}
   */
  extractKeysFromAST(ast) {
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
  validateKeysInAST(ast) {
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
