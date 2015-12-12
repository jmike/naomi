const {EventEmitter} = require('events');
const Promise = require('bluebird');

class Collection extends EventEmitter {

  /**
   * Constructs a new Collection instance.
   * @param {Database} db reference to the parent database.
   * @param {string} name the name of the collection.
   * @param {Object} [schema] the schema of the collection.
   * @throws {TypeError} if arguments are of invalid type
   * @constructor
   */
  constructor(db: Object, name: string, schema: ?Object) {
    // setup EventEmitter
    super();
    this.setMaxListeners(999);

    // handle optional arguments
    schema = schema || {};

    this.db = db;
    this.name = name;
    this.schema = schema;
  }

}

module.exports = Collection;
