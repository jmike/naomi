/* eslint-env node, mocha */

import { assert } from 'chai';
import naomi from '../src/naomi';
import Database from '../src/Database';

describe('naomi', () => {
  describe('#register()', () => {
    it('throws error when id is of invalid type', () => {
      assert.throws(() => naomi.register(123), TypeError);
      assert.throws(() => naomi.register(false), TypeError);
      assert.throws(() => naomi.register(null), TypeError);
      assert.throws(() => naomi.register({}), TypeError);
      assert.throws(() => naomi.register(new Date()), TypeError);
    });
  });

  describe('#database()', () => {
    naomi.register('mysql', Database);

    it('throws error when id is of invalid type', () => {
      assert.throws(() => naomi.create(123), TypeError);
      assert.throws(() => naomi.create(false), TypeError);
      assert.throws(() => naomi.create(null), TypeError);
      assert.throws(() => naomi.create({}), TypeError);
      assert.throws(() => naomi.create(new Date()), TypeError);
    });

    it('throws error when engine is unknown', () => {
      assert.throws(() => naomi.create('unknown'), Error);
    });

    // it('throws error when props is invalid', () => {
    //   assert.throws(() => naomi.create('mysql', 123), TypeError);
    //   assert.throws(() => naomi.create('mysql', false), TypeError);
    //   assert.throws(() => naomi.create('mysql', null), TypeError);
    //   assert.throws(() => naomi.create('mysql', 'string'), TypeError);
    // });
  });
});
