/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import StringType from '../../src/datatypes/Email';

describe('Email datatype', function() {
  it('accepts email formatted string values', function() {
    const dt = new StringType();
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

  it('respects length property', function() {
    const dt = new StringType();
    dt.length = 12;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert('abcd@acme.com', schema));
    assert.throws(() => Joi.assert('ab@acme.com', schema));
  });

  it('respects maxLength property', function() {
    const dt = new StringType();
    dt.maxLength = 12;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.doesNotThrow(() => Joi.assert('ab@acme.com', schema));
    assert.throws(() => Joi.assert('abcd@acme.com', schema));
  });

  it('respects minLength property', function() {
    const dt = new StringType();
    dt.minLength = 12;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.doesNotThrow(() => Joi.assert('abcd@acme.com', schema));
    assert.throws(() => Joi.assert('ab@acme.com', schema));
  });

  it('respects lowercase property', function() {
    const dt = new StringType();
    dt.lowercase = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert('aBc@acme.com', schema));
  });

  it('respects uppercase property', function() {
    const dt = new StringType();
    dt.uppercase = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('ABC@ACME.COM', schema));
    assert.throws(() => Joi.assert('aBc@acme.com', schema));
  });

  it('respects trim property', function() {
    const dt = new StringType();
    dt.trim = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc@acme.com', schema));
    assert.throws(() => Joi.assert(' abc@acme.com', schema));
    assert.throws(() => Joi.assert('abc@acme.com ', schema));
  });

  it('respects nullable property', function() {
    const dt = new StringType();
    dt.nullable = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = new StringType();
    dt.default = 'abc@acme.com';
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 'abc@acme.com');
  });
});
