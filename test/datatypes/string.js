/* eslint-env node, mocha */

import { assert } from 'chai';
import Joi from 'joi';
import string from '../../src/datatypes/string';

describe('string datatype', () => {
  it('asserts string value', () => {
    const dt = string();
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
    const dt = string();
    dt.length(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert('abcd', schema));
    assert.throws(() => Joi.assert('ab', schema));
  });

  it('respects maxLength property', () => {
    const dt = string();
    dt.maxLength(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.doesNotThrow(() => Joi.assert('ab', schema));
    assert.throws(() => Joi.assert('abcd', schema));
  });

  it('respects minLength property', () => {
    const dt = string();
    dt.minLength(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.doesNotThrow(() => Joi.assert('abcd', schema));
    assert.throws(() => Joi.assert('ab', schema));
  });

  it('respects lowercase property', () => {
    const dt = string();
    dt.lowercase(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert('aBc', schema));
  });

  it('respects uppercase property', () => {
    const dt = string();
    dt.uppercase(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('ABC', schema));
    assert.throws(() => Joi.assert('aBc', schema));
  });

  it('respects trim property', () => {
    const dt = string();
    dt.trim(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert(' abc', schema));
    assert.throws(() => Joi.assert('abc ', schema));
  });

  it('respects regex property', () => {
    const dt = string();
    dt.regex(/^\d+$/);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('123', schema));
    assert.throws(() => Joi.assert('123a', schema));
  });

  it('respects nullable property', () => {
    const dt = string();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', () => {
    const dt = string();
    dt.default('abc');
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 'abc');
  });

  describe('#length()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => string().length(10));
      assert.throws(() => string().length('abc'));
      assert.throws(() => string().length(1.1));
      assert.throws(() => string().length(null));
      assert.throws(() => string().length(true));
      assert.throws(() => string().length({}));
      assert.throws(() => string().length());
    });
  });

  describe('#maxLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => string().maxLength(10));
      assert.throws(() => string().maxLength('abc'));
      assert.throws(() => string().maxLength(1.1));
      assert.throws(() => string().maxLength(null));
      assert.throws(() => string().maxLength(true));
      assert.throws(() => string().maxLength({}));
      assert.throws(() => string().maxLength());
    });
  });

  describe('#minLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => string().minLength(10));
      assert.throws(() => string().minLength('abc'));
      assert.throws(() => string().minLength(1.1));
      assert.throws(() => string().minLength(null));
      assert.throws(() => string().minLength(true));
      assert.throws(() => string().minLength({}));
      assert.throws(() => string().minLength());
    });
  });

  describe('#lowercase()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => string().lowercase(true));
      assert.doesNotThrow(() => string().lowercase(false));
      assert.throws(() => string().lowercase('abc'));
      assert.throws(() => string().lowercase(123));
      assert.throws(() => string().lowercase(null));
      assert.throws(() => string().lowercase({}));
      assert.throws(() => string().lowercase());
    });
  });

  describe('#uppercase()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => string().uppercase(true));
      assert.doesNotThrow(() => string().uppercase(false));
      assert.throws(() => string().uppercase('abc'));
      assert.throws(() => string().uppercase(123));
      assert.throws(() => string().uppercase(null));
      assert.throws(() => string().uppercase({}));
      assert.throws(() => string().uppercase());
    });
  });

  describe('#trim()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => string().trim(true));
      assert.doesNotThrow(() => string().trim(false));
      assert.throws(() => string().trim('abc'));
      assert.throws(() => string().trim(123));
      assert.throws(() => string().trim(null));
      assert.throws(() => string().trim({}));
      assert.throws(() => string().trim());
    });
  });

  describe('#regex()', () => {
    it('accepts string and regex value', () => {
      assert.doesNotThrow(() => string().regex('abc'));
      assert.doesNotThrow(() => string().regex(/abc/i));
      assert.throws(() => string().regex(true));
      assert.throws(() => string().regex(123));
      assert.throws(() => string().regex(null));
      assert.throws(() => string().regex({}));
      assert.throws(() => string().regex());
    });
  });

  describe('#nullable()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => string().nullable(true));
      assert.doesNotThrow(() => string().nullable(false));
      assert.throws(() => string().nullable('abc'));
      assert.throws(() => string().nullable(123));
      assert.throws(() => string().nullable(null));
      assert.throws(() => string().nullable({}));
      assert.throws(() => string().nullable());
    });
  });
});
