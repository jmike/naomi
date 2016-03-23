import _ from 'lodash';
import type from 'type-of';
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
}

export default Collection;
