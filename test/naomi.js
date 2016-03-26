/* global describe, it */

import {assert} from 'chai';
import naomi from '../src/naomi';
import Database from '../src/Database';

describe('naomi', function () {
  describe('#registerDatabaseEngine()', function () {
    it('throws error when id is of invalid type', function () {
      assert.throws(() => naomi.registerDatabaseEngine(123), TypeError);
      assert.throws(() => naomi.registerDatabaseEngine(false), TypeError);
      assert.throws(() => naomi.registerDatabaseEngine(null), TypeError);
      assert.throws(() => naomi.registerDatabaseEngine({}), TypeError);
      assert.throws(() => naomi.registerDatabaseEngine(new Date()), TypeError);
    });
  });

  describe('#database()', function () {
    naomi.registerDatabaseEngine('mysql', Database);

    it('throws error when id is of invalid type', function () {
      assert.throws(() => naomi.database(123), TypeError);
      assert.throws(() => naomi.database(false), TypeError);
      assert.throws(() => naomi.database(null), TypeError);
      assert.throws(() => naomi.database({}), TypeError);
      assert.throws(() => naomi.database(new Date()), TypeError);
    });

    it('throws error when engine is unknown', function () {
      assert.throws(() => naomi.database('unknown'), TypeError);
    });

    // it('throws error when props is invalid', function () {
    //   assert.throws(() => naomi.database('mysql', 123), TypeError);
    //   assert.throws(() => naomi.database('mysql', false), TypeError);
    //   assert.throws(() => naomi.database('mysql', null), TypeError);
    //   assert.throws(() => naomi.database('mysql', 'string'), TypeError);
    // });
  });
});
