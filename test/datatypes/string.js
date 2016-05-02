/* eslint-env node, mocha */

import { assert } from 'chai';
import Joi from 'joi';
import StringType from '../../src/datatypes/String';

describe('String datatype', () => {
  it('asserts string value', () => {
    const dt = new StringType();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(1.1, schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(true, schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert(new Date(), schema));
  });

  it('respects length property', () => {
    const dt = new StringType();
    dt.length(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert('abcd', schema));
    assert.throws(() => Joi.assert('ab', schema));
  });

  it('respects maxLength property', () => {
    const dt = new StringType();
    dt.maxLength(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.doesNotThrow(() => Joi.assert('ab', schema));
    assert.throws(() => Joi.assert('abcd', schema));
  });

  it('respects minLength property', () => {
    const dt = new StringType();
    dt.minLength(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.doesNotThrow(() => Joi.assert('abcd', schema));
    assert.throws(() => Joi.assert('ab', schema));
  });

  it('respects lowercase property', () => {
    const dt = new StringType();
    dt.lowercase(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert('aBc', schema));
  });

  it('respects uppercase property', () => {
    const dt = new StringType();
    dt.uppercase(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('ABC', schema));
    assert.throws(() => Joi.assert('aBc', schema));
  });

  it('respects trim property', () => {
    const dt = new StringType();
    dt.trim(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert(' abc', schema));
    assert.throws(() => Joi.assert('abc ', schema));
  });

  it('respects regex property', () => {
    const dt = new StringType();
    dt.regex(/^\d+$/);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('123', schema));
    assert.throws(() => Joi.assert('123a', schema));
  });

  it('respects nullable property', () => {
    const dt = new StringType();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', () => {
    const dt = new StringType();
    dt.default('abc');
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 'abc');
  });

  describe('#length()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => new StringType().length(10));
      assert.throws(() => new StringType().length('abc'));
      assert.throws(() => new StringType().length(1.1));
      assert.throws(() => new StringType().length(null));
      assert.throws(() => new StringType().length(true));
      assert.throws(() => new StringType().length({}));
      assert.throws(() => new StringType().length());
    });
  });

  describe('#maxLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => new StringType().maxLength(10));
      assert.throws(() => new StringType().maxLength('abc'));
      assert.throws(() => new StringType().maxLength(1.1));
      assert.throws(() => new StringType().maxLength(null));
      assert.throws(() => new StringType().maxLength(true));
      assert.throws(() => new StringType().maxLength({}));
      assert.throws(() => new StringType().maxLength());
    });
  });

  describe('#minLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => new StringType().minLength(10));
      assert.throws(() => new StringType().minLength('abc'));
      assert.throws(() => new StringType().minLength(1.1));
      assert.throws(() => new StringType().minLength(null));
      assert.throws(() => new StringType().minLength(true));
      assert.throws(() => new StringType().minLength({}));
      assert.throws(() => new StringType().minLength());
    });
  });

  describe('#lowercase()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new StringType().lowercase(true));
      assert.doesNotThrow(() => new StringType().lowercase(false));
      assert.throws(() => new StringType().lowercase('abc'));
      assert.throws(() => new StringType().lowercase(123));
      assert.throws(() => new StringType().lowercase(null));
      assert.throws(() => new StringType().lowercase({}));
      assert.throws(() => new StringType().lowercase());
    });
  });

  describe('#uppercase()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new StringType().uppercase(true));
      assert.doesNotThrow(() => new StringType().uppercase(false));
      assert.throws(() => new StringType().uppercase('abc'));
      assert.throws(() => new StringType().uppercase(123));
      assert.throws(() => new StringType().uppercase(null));
      assert.throws(() => new StringType().uppercase({}));
      assert.throws(() => new StringType().uppercase());
    });
  });

  describe('#trim()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new StringType().trim(true));
      assert.doesNotThrow(() => new StringType().trim(false));
      assert.throws(() => new StringType().trim('abc'));
      assert.throws(() => new StringType().trim(123));
      assert.throws(() => new StringType().trim(null));
      assert.throws(() => new StringType().trim({}));
      assert.throws(() => new StringType().trim());
    });
  });

  describe('#regex()', () => {
    it('accepts string and regex value', () => {
      assert.doesNotThrow(() => new StringType().regex('abc'));
      assert.doesNotThrow(() => new StringType().regex(/abc/i));
      assert.throws(() => new StringType().regex(true));
      assert.throws(() => new StringType().regex(123));
      assert.throws(() => new StringType().regex(null));
      assert.throws(() => new StringType().regex({}));
      assert.throws(() => new StringType().regex());
    });
  });

  describe('#nullable()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new StringType().nullable(true));
      assert.doesNotThrow(() => new StringType().nullable(false));
      assert.throws(() => new StringType().nullable('abc'));
      assert.throws(() => new StringType().nullable(123));
      assert.throws(() => new StringType().nullable(null));
      assert.throws(() => new StringType().nullable({}));
      assert.throws(() => new StringType().nullable());
    });
  });
});
