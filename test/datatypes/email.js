/* eslint-env node, mocha */

import { assert } from 'chai';
import Joi from 'joi';
import EmailType from '../../src/datatypes/Email';

describe('Email datatype', () => {
  it('asserts email-formatted string value', () => {
    const dt = new EmailType();
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
    const dt = new EmailType();
    dt.length(12);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert('abcd@acme.com', schema));
    assert.throws(() => Joi.assert('ab@acme.com', schema));
  });

  it('respects maxLength property', () => {
    const dt = new EmailType();
    dt.maxLength(12);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.doesNotThrow(() => Joi.assert('ab@acme.com', schema));
    assert.throws(() => Joi.assert('abcd@acme.com', schema));
  });

  it('respects minLength property', () => {
    const dt = new EmailType();
    dt.minLength(12);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.doesNotThrow(() => Joi.assert('abcd@acme.com', schema));
    assert.throws(() => Joi.assert('ab@acme.com', schema));
  });

  it('respects lowercase property', () => {
    const dt = new EmailType();
    dt.lowercase(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert('aBc@acme.com', schema));
  });

  it('respects uppercase property', () => {
    const dt = new EmailType();
    dt.uppercase(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('ABC@ACME.COM', schema));
    assert.throws(() => Joi.assert('aBc@acme.com', schema));
  });

  it('respects nullable property', () => {
    const dt = new EmailType();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects trim property', () => {
    const dt = new EmailType();
    dt.trim(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert(' abc@acme.com', schema));
    assert.throws(() => Joi.assert('abc@acme.com ', schema));
  });

  it('respects default property', () => {
    const dt = new EmailType();
    dt.default('abc@acme.com');
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 'abc@acme.com');
  });

  describe('#length()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => new EmailType().length(10));
      assert.throws(() => new EmailType().length('abc'));
      assert.throws(() => new EmailType().length(1.1));
      assert.throws(() => new EmailType().length(null));
      assert.throws(() => new EmailType().length(true));
      assert.throws(() => new EmailType().length({}));
      assert.throws(() => new EmailType().length());
    });
  });

  describe('#maxLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => new EmailType().maxLength(10));
      assert.throws(() => new EmailType().maxLength('abc'));
      assert.throws(() => new EmailType().maxLength(1.1));
      assert.throws(() => new EmailType().maxLength(null));
      assert.throws(() => new EmailType().maxLength(true));
      assert.throws(() => new EmailType().maxLength({}));
      assert.throws(() => new EmailType().maxLength());
    });
  });

  describe('#minLength()', () => {
    it('accepts integer value', () => {
      assert.doesNotThrow(() => new EmailType().minLength(10));
      assert.throws(() => new EmailType().minLength('abc'));
      assert.throws(() => new EmailType().minLength(1.1));
      assert.throws(() => new EmailType().minLength(null));
      assert.throws(() => new EmailType().minLength(true));
      assert.throws(() => new EmailType().minLength({}));
      assert.throws(() => new EmailType().minLength());
    });
  });

  describe('#lowercase()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new EmailType().lowercase(true));
      assert.doesNotThrow(() => new EmailType().lowercase(false));
      assert.throws(() => new EmailType().lowercase('abc'));
      assert.throws(() => new EmailType().lowercase(123));
      assert.throws(() => new EmailType().lowercase(null));
      assert.throws(() => new EmailType().lowercase({}));
      assert.throws(() => new EmailType().lowercase());
    });
  });

  describe('#uppercase()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new EmailType().uppercase(true));
      assert.doesNotThrow(() => new EmailType().uppercase(false));
      assert.throws(() => new EmailType().uppercase('abc'));
      assert.throws(() => new EmailType().uppercase(123));
      assert.throws(() => new EmailType().uppercase(null));
      assert.throws(() => new EmailType().uppercase({}));
      assert.throws(() => new EmailType().uppercase());
    });
  });

  describe('#trim()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new EmailType().trim(true));
      assert.doesNotThrow(() => new EmailType().trim(false));
      assert.throws(() => new EmailType().trim('abc'));
      assert.throws(() => new EmailType().trim(123));
      assert.throws(() => new EmailType().trim(null));
      assert.throws(() => new EmailType().trim({}));
      assert.throws(() => new EmailType().trim());
    });
  });

  describe('#nullable()', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new EmailType().nullable(true));
      assert.doesNotThrow(() => new EmailType().nullable(false));
      assert.throws(() => new EmailType().nullable('abc'));
      assert.throws(() => new EmailType().nullable(123));
      assert.throws(() => new EmailType().nullable(null));
      assert.throws(() => new EmailType().nullable({}));
      assert.throws(() => new EmailType().nullable());
    });
  });
});
