/* global describe, it */
const {assert} = require('chai');

const naomi = require('../src/Naomi');
const Database = require('../src/Database');

describe('Naomi', function () {
  describe('#registerEngine()', function () {
    it('throws error when id is of invalid type', function () {
      assert.throws(() => naomi.create(123), TypeError);
      assert.throws(() => naomi.create(false), TypeError);
      assert.throws(() => naomi.create(null), TypeError);
      assert.throws(() => naomi.create({}), TypeError);
      assert.throws(() => naomi.create(new Date()), TypeError);
    });
  });

  describe('#create()', function () {
    naomi.registerEngine('mysql', Database);

    it('throws error when id is of invalid type', function () {
      assert.throws(() => naomi.create(123), TypeError);
      assert.throws(() => naomi.create(false), TypeError);
      assert.throws(() => naomi.create(null), TypeError);
      assert.throws(() => naomi.create({}), TypeError);
      assert.throws(() => naomi.create(new Date()), TypeError);
    });

    it('throws error when engine is unknown', function () {
      assert.throws(() => naomi.create('unknown'), 'UnknownDatabaseEngine');
    });

    // it('throws error when props is invalid', function () {
    //   assert.throws(() => naomi.create('mysql', 123), TypeError);
    //   assert.throws(() => naomi.create('mysql', false), TypeError);
    //   assert.throws(() => naomi.create('mysql', null), TypeError);
    //   assert.throws(() => naomi.create('mysql', 'string'), TypeError);
    // });
  });
});
