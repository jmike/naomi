/* eslint-env node, mocha */

import { assert } from 'chai';
import Joi from 'joi';
import BinaryType from '../../src/datatypes/Binary';

describe('Binary datatype', () => {
  it('asserts buffer', () => {
    const dt = new BinaryType();
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

  it('respects length property', () => {
    const dt = new BinaryType();
    dt.length(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2, 3, 4]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2]), schema));
  });

  it('respects maxLength property', () => {
    const dt = new BinaryType();
    dt.maxLength(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3]), schema));
    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2, 3, 4]), schema));
  });

  it('respects minLength property', () => {
    const dt = new BinaryType();
    dt.minLength(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3]), schema));
    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3, 4]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2]), schema));
  });

  it('respects nullable property', () => {
    const dt = new BinaryType();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', () => {
    const dt = new BinaryType();
    const buf = new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
    dt.default(buf);
    const schema = dt.toJoi();

    assert.strictEqual(buf.compare(Joi.attempt(undefined, schema)), 0);
  });

  describe('#length()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => new BinaryType().length(10));
      assert.throws(() => new BinaryType().length('abc'));
      assert.throws(() => new BinaryType().length(1.1));
      assert.throws(() => new BinaryType().length(null));
      assert.throws(() => new BinaryType().length(true));
      assert.throws(() => new BinaryType().length({}));
      assert.throws(() => new BinaryType().length());
    });
  });

  describe('#maxLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => new BinaryType().maxLength(10));
      assert.throws(() => new BinaryType().maxLength('abc'));
      assert.throws(() => new BinaryType().maxLength(1.1));
      assert.throws(() => new BinaryType().maxLength(null));
      assert.throws(() => new BinaryType().maxLength(true));
      assert.throws(() => new BinaryType().maxLength({}));
      assert.throws(() => new BinaryType().maxLength());
    });
  });

  describe('#minLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => new BinaryType().minLength(10));
      assert.throws(() => new BinaryType().minLength('abc'));
      assert.throws(() => new BinaryType().minLength(1.1));
      assert.throws(() => new BinaryType().minLength(null));
      assert.throws(() => new BinaryType().minLength(true));
      assert.throws(() => new BinaryType().minLength({}));
      assert.throws(() => new BinaryType().minLength());
    });
  });

  describe('#nullable()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new BinaryType().nullable(true));
      assert.doesNotThrow(() => new BinaryType().nullable(false));
      assert.throws(() => new BinaryType().nullable('abc'));
      assert.throws(() => new BinaryType().nullable(123));
      assert.throws(() => new BinaryType().nullable(null));
      assert.throws(() => new BinaryType().nullable({}));
      assert.throws(() => new BinaryType().nullable());
    });
  });
});
