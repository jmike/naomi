/* global describe, it */

import {assert} from 'chai';
import Promise from 'bluebird';
import Database from '../src/Database';
import Collection from '../src/Collection';

describe('Collection', function () {
  const db = new Database({});

  describe('#constructor()', function () {
    it('throws error when db is unspecified', function () {
      assert.throws(() => new Collection(), TypeError);
    });

    it('throws error when db is of invalid type', function () {
      assert.throws(() => new Collection(123), TypeError);
      assert.throws(() => new Collection(false), TypeError);
      assert.throws(() => new Collection(null), TypeError);
      assert.throws(() => new Collection({}), TypeError);
    });

    it('throws error when name is unspecified', function () {
      assert.throws(() => new Collection(db), TypeError);
    });

    it('throws error when name is of invalid type', function () {
      assert.throws(() => new Collection(db, 123), TypeError);
      assert.throws(() => new Collection(db, false), TypeError);
      assert.throws(() => new Collection(db, null), TypeError);
      assert.throws(() => new Collection(db, {}), TypeError);
    });

    it('throws error when schema is of invalid type', function () {
      assert.throws(() => new Collection(db, 'name', 'str'), TypeError);
      assert.throws(() => new Collection(db, 'name', false), TypeError);
      assert.throws(() => new Collection(db, 'name', null), TypeError);
      assert.throws(() => new Collection(db, 'name', 123), TypeError);
    });
  });

  describe('#reverseEngineer()', function () {
    it('returns bluebird promise', function () {
      const collection = new Collection(db, 'name');
      assert.instanceOf(collection.reverseEngineer(), Promise);
    });

    it('accepts callback function', function (done) {
      const collection = new Collection(db, 'name');
      collection.reverseEngineer(done);
    });
  });

  describe('#register()', function () {
    it('returns bluebird promise', function () {
      const collection = new Collection(db, 'name');
      assert.instanceOf(collection.register(), Promise);
    });

    it('accepts callback function', function (done) {
      const collection = new Collection(db, 'name');
      collection.register(done);
    });

    it('throws error when name is of invalid type', function () {
      const collection = new Collection(db, 'name');
      assert.throws(() => collection.register(123), TypeError);
      assert.throws(() => collection.register(false), TypeError);
      assert.throws(() => collection.register(null), TypeError);
      assert.throws(() => collection.register({}), TypeError);
    });
  });

  describe('#find()', function () {
    it('returns bluebird promise', function () {
      const collection = new Collection(db, 'name');
      assert.instanceOf(collection.find(), Promise);
    });

    it('accepts callback function', function (done) {
      const collection = new Collection(db, 'name');
      collection.find(done);
    });

    it('throws error when $query is of invalid type', function () {
      const collection = new Collection(db, 'name');
      assert.throws(() => collection.find(null), TypeError);
    });
  });

  describe('#findOne()', function () {
    it('returns bluebird promise', function () {
      const collection = new Collection(db, 'name');
      assert.instanceOf(collection.findOne(), Promise);
    });

    it('accepts callback function', function (done) {
      const collection = new Collection(db, 'name');
      collection.findOne(done);
    });

    it('throws error when $query is of invalid type', function () {
      const collection = new Collection(db, 'name');
      assert.throws(() => collection.findOne(null), TypeError);
    });
  });

  describe('#count()', function () {
    it('returns bluebird promise', function () {
      const collection = new Collection(db, 'name');
      assert.instanceOf(collection.count(), Promise);
    });

    it('accepts callback function', function (done) {
      const collection = new Collection(db, 'name');
      collection.count(done);
    });

    it('throws error when $query is of invalid type', function () {
      const collection = new Collection(db, 'name');
      assert.throws(() => collection.count(null), TypeError);
    });
  });

  describe('#remove()', function () {
    it('returns bluebird promise', function () {
      const collection = new Collection(db, 'name');
      assert.instanceOf(collection.remove(), Promise);
    });

    it('accepts callback function', function (done) {
      const collection = new Collection(db, 'name');
      collection.remove(done);
    });

    it('throws error when $query is of invalid type', function () {
      const collection = new Collection(db, 'name');
      assert.throws(() => collection.remove(null), TypeError);
    });
  });

  describe('#insert()', function () {
    it('returns bluebird promise', function () {
      const collection = new Collection(db, 'name');
      assert.instanceOf(collection.insert({}), Promise);
    });

    it('accepts callback function', function (done) {
      const collection = new Collection(db, 'name');
      collection.insert({}, done);
    });

    it('throws error when records is of invalid type', function () {
      const collection = new Collection(db, 'name');
      assert.throws(() => collection.insert(null), TypeError);
      assert.throws(() => collection.insert(123), TypeError);
      assert.throws(() => collection.insert('str'), TypeError);
      assert.throws(() => collection.insert(true), TypeError);
    });
  });

  describe('#update()', function () {
    it('returns bluebird promise', function () {
      const collection = new Collection(db, 'name');
      assert.instanceOf(collection.update({}), Promise);
    });

    it('accepts callback function', function (done) {
      const collection = new Collection(db, 'name');
      collection.update({}, done);
    });

    it('throws error when records is of invalid type', function () {
      const collection = new Collection(db, 'name');
      assert.throws(() => collection.update(null), TypeError);
      assert.throws(() => collection.update(123), TypeError);
      assert.throws(() => collection.update('str'), TypeError);
      assert.throws(() => collection.update(true), TypeError);
    });
  });
});
