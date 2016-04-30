/* eslint-env node, mocha */

import { assert } from 'chai';
import Promise from 'bluebird';
import Database from '../src/Database';
import Collection from '../src/Collection';

describe('Database', () => {
  describe('#constructor()', () => {
    it('throws error when connectionProperties is unspecified', () => {
      assert.throws(() => new Database(), TypeError);
    });

    it('throws error when connectionProperties is of invalid type', () => {
      assert.throws(() => new Database(123), TypeError);
      assert.throws(() => new Database(false), TypeError);
      assert.throws(() => new Database(null), TypeError);
      assert.throws(() => new Database('str'), TypeError);
    });
  });

  describe('#connect()', () => {
    it('throws error when callback is of invalid type', () => {
      const db = new Database({});

      assert.throws(() => db.connect(123), TypeError);
      assert.throws(() => db.connect(false), TypeError);
      assert.throws(() => db.connect('str'), TypeError);
      assert.throws(() => db.connect({}), TypeError);
    });

    it('returns bluebird promise', () => {
      const db = new Database({});

      assert.instanceOf(db.connect(), Promise);
    });

    it('accepts callback function', (done) => {
      const db = new Database({});

      db.connect(done);
    });

    it('sets @isConnected to true', () => {
      const db = new Database({});

      assert.isFalse(db.isConnected);
      db.connect()
        .then(() => assert.isTrue(db.isConnected));
    });
  });

  describe('#disconnect()', () => {
    it('throws error when callback is of invalid type', () => {
      const db = new Database({});

      assert.throws(() => db.disconnect(123), TypeError);
      assert.throws(() => db.disconnect(false), TypeError);
      assert.throws(() => db.disconnect('str'), TypeError);
      assert.throws(() => db.disconnect({}), TypeError);
    });

    it('returns bluebird promise', () => {
      const db = new Database({});

      assert.instanceOf(db.disconnect(), Promise);
    });

    it('accepts callback function', (done) => {
      const db = new Database({});

      db.disconnect(done);
    });

    it('sets @isConnected to false', () => {
      const db = new Database({});

      db.connect()
        .then(() => assert.isTrue(db.isConnected))
        .then(() => db.disconnect())
        .then(() => assert.isFalse(db.isConnected));
    });
  });

  describe('#collection()', () => {
    it('returns a new Collection instance bound to this database', () => {
      const db = new Database({});
      const employees = db.collection('employees');
      assert.instanceOf(employees, Collection);
      assert.strictEqual(employees.db, db);
    });
  });
});
