import { EventEmitter } from 'events';
import Promise from 'bluebird';
import _ from 'lodash';
import type from 'type-of';
import Collection from './Collection';
import Schema from './Schema'; // eslint-disable-line

class Database extends EventEmitter {

  constructor(connectionProperties) {
    // setup event emitter
    super();
    this.setMaxListeners(999);

    this.connectionProperties = connectionProperties;
    this.isConnected = false;
  }

  connect(callback) {
    // make sure callback is valid
    if (!_.isFunction(callback) && !_.isUndefined(callback)) {
      throw new TypeError(`Invalid "callback" argument; expected Function, received ${type(callback)}`);
    }

    // check if already connected
    if (this.isConnected) {
      return Promise.resolve().nodeify(callback);
    }

    // connect
    return Promise.resolve()
      .then(() => {
        this.isConnected = true;
        this.emit('connect');
      })
      .nodeify(callback);
  }

  disconnect(callback) {
    // make sure callback is valid
    if (!_.isFunction(callback) && !_.isUndefined(callback)) {
      throw new TypeError(`Invalid "callback" argument; expected Function, received ${type(callback)}`);
    }

    // check if already disconnected
    if (!this.isConnected) {
      return Promise.resolve().nodeify(callback);
    }

    // disconnect
    return Promise.resolve()
      .then(() => {
        this.isConnected = false;
        this.emit('disconnect');
      })
      .nodeify(callback);
  }

  _awaitConnect(timeout = 60000) {
    if (!_.isInteger(timeout)) {
      throw new TypeError(`Invalid "timeout" argument; expected integer, received ${type(timeout)}`);
    }

    return new Promise((resolve) => {
      if (this.isConnected) {
        resolve();
      } else {
        this.once('connect', () => resolve());
      }
    });
  }

  collection(name, schema) {
    if (!_.isString(name)) {
      throw new TypeError(`Invalid "name" argument; expected string, received ${type(name)}`);
    }

    if (!(schema instanceof Schema || _.isObject(schema))) {
      throw new TypeError(`Invalid "schema" argument; expected Object or Schema, received ${type(schema)}`);
    }

    return new Collection(this, name, schema);
  }

}

export default Database;
