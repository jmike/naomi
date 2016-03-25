/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import binary from '../../src/datatypes/binary';

describe('binary datatype', function() {
  it('asserts buffer', function() {
    const dt = binary();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]), schema));
    assert.throws(() => Joi.assert('str', schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(1.1, schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(true, schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert(new Date(), schema));
  });

  it('respects length property', function() {
    const dt = binary();
    dt.length(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2, 3, 4]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2]), schema));
  });

  it('respects maxLength property', function() {
    const dt = binary();
    dt.maxLength(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3]), schema));
    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2, 3, 4]), schema));
  });

  it('respects minLength property', function() {
    const dt = binary();
    dt.minLength(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3]), schema));
    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3, 4]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2]), schema));
  });

  it('respects nullable property', function() {
    const dt = binary();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = binary();
    const buf = new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
    dt.default(buf);
    const schema = dt.toJoi();

    assert.strictEqual(buf.compare(Joi.attempt(undefined, schema)), 0);
  });

  describe('#length()', function() {
    it('accepts integer value', function() {
      assert.doesNotThrow(() => binary().length(10));
      assert.throws(() => binary().length('abc'));
      assert.throws(() => binary().length(1.1));
      assert.throws(() => binary().length(null));
      assert.throws(() => binary().length(true));
      assert.throws(() => binary().length({}));
      assert.throws(() => binary().length());
    });
  });

  describe('#maxLength()', function() {
    it('accepts integer value', function() {
      assert.doesNotThrow(() => binary().maxLength(10));
      assert.throws(() => binary().maxLength('abc'));
      assert.throws(() => binary().maxLength(1.1));
      assert.throws(() => binary().maxLength(null));
      assert.throws(() => binary().maxLength(true));
      assert.throws(() => binary().maxLength({}));
      assert.throws(() => binary().maxLength());
    });
  });

  describe('#minLength()', function() {
    it('accepts integer value', function() {
      assert.doesNotThrow(() => binary().minLength(10));
      assert.throws(() => binary().minLength('abc'));
      assert.throws(() => binary().minLength(1.1));
      assert.throws(() => binary().minLength(null));
      assert.throws(() => binary().minLength(true));
      assert.throws(() => binary().minLength({}));
      assert.throws(() => binary().minLength());
    });
  });

  describe('#nullable()', function() {
    it('accepts boolean value', function() {
      assert.doesNotThrow(() => binary().nullable(true));
      assert.doesNotThrow(() => binary().nullable(false));
      assert.throws(() => binary().nullable('abc'));
      assert.throws(() => binary().nullable(123));
      assert.throws(() => binary().nullable(null));
      assert.throws(() => binary().nullable({}));
      assert.throws(() => binary().nullable());
    });
  });
});
