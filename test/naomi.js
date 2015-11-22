/* global describe, it */

const {assert} = require('chai');
const naomi = require('../src/Naomi');

describe('Naomi', function () {
  describe('#registerEngine()', function () {
    it('throws error when id is of invalid type', function () {
      assert.throws(() => naomi.create(123), 'InvalidArgument');
      assert.throws(() => naomi.create(false), 'InvalidArgument');
      assert.throws(() => naomi.create(null), 'InvalidArgument');
      assert.throws(() => naomi.create({}), 'InvalidArgument');
      assert.throws(() => naomi.create(new Date()), 'InvalidArgument');
    });
  });

  describe('#create()', function () {
    it('throws error when id is of invalid type', function () {
      assert.throws(() => naomi.create(123), 'InvalidArgument');
      assert.throws(() => naomi.create(false), 'InvalidArgument');
      assert.throws(() => naomi.create(null), 'InvalidArgument');
      assert.throws(() => naomi.create({}), 'InvalidArgument');
      assert.throws(() => naomi.create(new Date()), 'InvalidArgument');
    });

    it('throws error when engine is unknown', function () {
      assert.throws(() => naomi.create('unknown'), 'UnknownDatabaseEngine');
    });

    it('throws error when props is invalid', function () {
      assert.throws(() => naomi.create('mysql', 123), 'InvalidArgument');
      assert.throws(() => naomi.create('mysql', false), 'InvalidArgument');
      assert.throws(() => naomi.create('mysql', null), 'InvalidArgument');
      assert.throws(() => naomi.create('mysql', 'string'), 'InvalidArgument');
      assert.throws(() => naomi.create('mysql', new Date()), 'InvalidArgument');
    });
  });
});
