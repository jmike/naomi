/* global describe, it */
const {assert} = require('chai');
const Promise = require('bluebird');
const Database = require('../src/Database');

describe('Database', function () {
  describe('#constructor()', function () {
    it('throws error when connectionProperties unspecified', function () {
      assert.throws(() => new Database(), TypeError);
    });

    it('throws error when connectionProperties is of invalid type', function () {
      assert.throws(() => new Database(123), TypeError);
      assert.throws(() => new Database(false), TypeError);
      assert.throws(() => new Database(null), TypeError);
      assert.throws(() => new Database('str'), TypeError);
    });
  });

  describe('#connect()', function () {
    it('throws error when callback is of invalid type', function () {
      const db = new Database({});

      assert.throws(() => db.connect(123), TypeError);
      assert.throws(() => db.connect(false), TypeError);
      assert.throws(() => db.connect('str'), TypeError);
      assert.throws(() => db.connect({}), TypeError);
    });

    it('returns bluebird promise', function () {
      const db = new Database({});

      assert.instanceOf(db.connect(), Promise);
    });

    it('accepts callback function', function (done) {
      const db = new Database({});

      db.connect(done);
    });

    it('sets @isConnected to true', function () {
      const db = new Database({});

      assert.isFalse(db.isConnected);
      db.connect()
        .then(() => assert.isTrue(db.isConnected));
    });
  });

  describe('#disconnect()', function () {
    it('throws error when callback is of invalid type', function () {
      const db = new Database({});

      assert.throws(() => db.disconnect(123), TypeError);
      assert.throws(() => db.disconnect(false), TypeError);
      assert.throws(() => db.disconnect('str'), TypeError);
      assert.throws(() => db.disconnect({}), TypeError);
    });

    it('returns bluebird promise', function () {
      const db = new Database({});

      assert.instanceOf(db.disconnect(), Promise);
    });

    it('accepts callback function', function (done) {
      const db = new Database({});

      db.disconnect(done);
    });

    it('sets @isConnected to false', function () {
      const db = new Database({});

      db.connect()
        .then(() => assert.isTrue(db.isConnected))
        .then(() => db.disconnect())
        .then(() => assert.isFalse(db.isConnected));
    });
  });

  describe('#query()', function () {
    it('throws error when sql is unspecified', function () {
      const db = new Database({});

      db.connect()
        .then(() => assert.throws(() => db.query(), TypeError));
    });

    it('throws error when sql is of invalid type', function () {
      const db = new Database({});

      db.connect()
        .then(() => assert.throws(() => db.query(123), TypeError))
        .then(() => assert.throws(() => db.query({}), TypeError))
        .then(() => assert.throws(() => db.query(null), TypeError))
        .then(() => assert.throws(() => db.query(true), TypeError));
    });

    it('returns bluebird promise', function () {
      const db = new Database({});

      db.connect()
        .then(() => assert.instanceOf(db.query('SELECT 123;'), Promise));
    });
  });
});
