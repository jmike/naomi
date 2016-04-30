/* eslint-env node, mocha */

import {assert} from 'chai';
import Joi from 'joi';
import email from '../../src/datatypes/email';

describe('email datatype', () => {
  it('asserts email-formatted string value', () => {
    const dt = email();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(1.1, schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(true, schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert(new Date(), schema));
  });

  it('respects length property', () => {
    const dt = email();
    dt.length(12);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert('abcd@acme.com', schema));
    assert.throws(() => Joi.assert('ab@acme.com', schema));
  });

  it('respects maxLength property', () => {
    const dt = email();
    dt.maxLength(12);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.doesNotThrow(() => Joi.assert('ab@acme.com', schema));
    assert.throws(() => Joi.assert('abcd@acme.com', schema));
  });

  it('respects minLength property', () => {
    const dt = email();
    dt.minLength(12);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.doesNotThrow(() => Joi.assert('abcd@acme.com', schema));
    assert.throws(() => Joi.assert('ab@acme.com', schema));
  });

  it('respects lowercase property', () => {
    const dt = email();
    dt.lowercase(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert('aBc@acme.com', schema));
  });

  it('respects uppercase property', () => {
    const dt = email();
    dt.uppercase(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('ABC@ACME.COM', schema));
    assert.throws(() => Joi.assert('aBc@acme.com', schema));
  });

  it('respects nullable property', () => {
    const dt = email();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects trim property', () => {
    const dt = email();
    dt.trim(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert(' abc@acme.com', schema));
    assert.throws(() => Joi.assert('abc@acme.com ', schema));
  });

  it('respects default property', () => {
    const dt = email();
    dt.default('abc@acme.com');
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 'abc@acme.com');
  });

  describe('#length()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => email().length(10));
      assert.throws(() => email().length('abc'));
      assert.throws(() => email().length(1.1));
      assert.throws(() => email().length(null));
      assert.throws(() => email().length(true));
      assert.throws(() => email().length({}));
      assert.throws(() => email().length());
    });
  });

  describe('#maxLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => email().maxLength(10));
      assert.throws(() => email().maxLength('abc'));
      assert.throws(() => email().maxLength(1.1));
      assert.throws(() => email().maxLength(null));
      assert.throws(() => email().maxLength(true));
      assert.throws(() => email().maxLength({}));
      assert.throws(() => email().maxLength());
    });
  });

  describe('#minLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => email().minLength(10));
      assert.throws(() => email().minLength('abc'));
      assert.throws(() => email().minLength(1.1));
      assert.throws(() => email().minLength(null));
      assert.throws(() => email().minLength(true));
      assert.throws(() => email().minLength({}));
      assert.throws(() => email().minLength());
    });
  });

  describe('#lowercase()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => email().lowercase(true));
      assert.doesNotThrow(() => email().lowercase(false));
      assert.throws(() => email().lowercase('abc'));
      assert.throws(() => email().lowercase(123));
      assert.throws(() => email().lowercase(null));
      assert.throws(() => email().lowercase({}));
      assert.throws(() => email().lowercase());
    });
  });

  describe('#uppercase()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => email().uppercase(true));
      assert.doesNotThrow(() => email().uppercase(false));
      assert.throws(() => email().uppercase('abc'));
      assert.throws(() => email().uppercase(123));
      assert.throws(() => email().uppercase(null));
      assert.throws(() => email().uppercase({}));
      assert.throws(() => email().uppercase());
    });
  });

  describe('#trim()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => email().trim(true));
      assert.doesNotThrow(() => email().trim(false));
      assert.throws(() => email().trim('abc'));
      assert.throws(() => email().trim(123));
      assert.throws(() => email().trim(null));
      assert.throws(() => email().trim({}));
      assert.throws(() => email().trim());
    });
  });

  describe('#nullable()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => email().nullable(true));
      assert.doesNotThrow(() => email().nullable(false));
      assert.throws(() => email().nullable('abc'));
      assert.throws(() => email().nullable(123));
      assert.throws(() => email().nullable(null));
      assert.throws(() => email().nullable({}));
      assert.throws(() => email().nullable());
    });
  });
});
