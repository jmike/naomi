/* eslint-env node, mocha */

import { assert } from 'chai';
import Database from '../src/Database';
import Collection from '../src/Collection';

describe('Collection', () => {
  const db = new Database({});

  describe('#constructor()', () => {
    it('throws error when db is unspecified', () => {
      assert.throws(() => new Collection(), TypeError);
    });

    it('throws error when db is of invalid type', () => {
      assert.throws(() => new Collection(123), TypeError);
      assert.throws(() => new Collection(false), TypeError);
      assert.throws(() => new Collection(null), TypeError);
      assert.throws(() => new Collection({}), TypeError);
    });

    it('throws error when name is unspecified', () => {
      assert.throws(() => new Collection(db), TypeError);
    });

    it('throws error when name is of invalid type', () => {
      assert.throws(() => new Collection(db, 123), TypeError);
      assert.throws(() => new Collection(db, false), TypeError);
      assert.throws(() => new Collection(db, null), TypeError);
      assert.throws(() => new Collection(db, {}), TypeError);
    });

    it('throws error when schema is of invalid type', () => {
      assert.throws(() => new Collection(db, 'name', 'str'), TypeError);
      assert.throws(() => new Collection(db, 'name', false), TypeError);
      assert.throws(() => new Collection(db, 'name', null), TypeError);
      assert.throws(() => new Collection(db, 'name', 123), TypeError);
    });
  });
});
