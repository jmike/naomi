/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import StringType from '../../src/datatypes/String';

describe('String datatype', function() {
  it('accepts string values', function() {
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

  it('respects length property', function() {
    const dt = new StringType();
    dt.length = 3;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert('abcd', schema));
    assert.throws(() => Joi.assert('ab', schema));
  });

  it('respects maxLength property', function() {
    const dt = new StringType();
    dt.maxLength = 3;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.doesNotThrow(() => Joi.assert('ab', schema));
    assert.throws(() => Joi.assert('abcd', schema));
  });

  it('respects minLength property', function() {
    const dt = new StringType();
    dt.minLength = 3;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.doesNotThrow(() => Joi.assert('abcd', schema));
    assert.throws(() => Joi.assert('ab', schema));
  });

  it('respects lowercase property', function() {
    const dt = new StringType();
    dt.lowercase = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert('aBc', schema));
  });

  it('respects uppercase property', function() {
    const dt = new StringType();
    dt.uppercase = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('ABC', schema));
    assert.throws(() => Joi.assert('aBc', schema));
  });

  it('respects trim property', function() {
    const dt = new StringType();
    dt.trim = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert(' abc', schema));
    assert.throws(() => Joi.assert('abc ', schema));
  });

  it('respects regex property', function() {
    const dt = new StringType();
    dt.regex = /^\d+$/;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('123', schema));
    assert.throws(() => Joi.assert('123a', schema));
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
    dt.default = 'abc';
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 'abc');
  });
});
