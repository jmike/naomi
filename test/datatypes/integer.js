/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import integer from '../../src/datatypes/integer';

describe('integer datatype', function() {
  it('asserts integer values', function() {
    const dt = integer();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(1.1, schema));
    assert.throws(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(true, schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert(new Date(), schema));
  });

  it('respects min property', function() {
    const dt = integer();
    dt.min(100);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(100, schema));
    assert.throws(() => Joi.assert(99, schema));
  });

  it('respects max property', function() {
    const dt = integer();
    dt.max(100);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(100, schema));
    assert.throws(() => Joi.assert(101, schema));
  });

  it('respects negative property', function() {
    const dt = integer();
    dt.negative(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(-1, schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(0, schema));
  });

  it('respects positive property', function() {
    const dt = integer();
    dt.positive(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(1, schema));
    assert.throws(() => Joi.assert(0, schema));
    assert.throws(() => Joi.assert(-1, schema));
  });

  it('respects nullable property', function() {
    const dt = integer();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = integer();
    dt.default(10);
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 10);
  });
});
