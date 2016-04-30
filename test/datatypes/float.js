/* eslint-env node, mocha */

import { assert } from 'chai';
import Joi from 'joi';
import float from '../../src/datatypes/float';

describe('float datatype', () => {
  it('accepts numeric values', () => {
    const dt = float();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(123, schema));
    assert.doesNotThrow(() => Joi.assert(1.1, schema));
    assert.throws(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(true, schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert(new Date(), schema));
  });

  it('respects min property', () => {
    const dt = float();
    dt.min(100);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(100, schema));
    assert.throws(() => Joi.assert(99, schema));
  });

  it('respects max property', () => {
    const dt = float();
    dt.max(100);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(100, schema));
    assert.throws(() => Joi.assert(101, schema));
  });

  it('respects negative property', () => {
    const dt = float();
    dt.negative(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(-1, schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(0, schema));
  });

  it('respects positive property', () => {
    const dt = float();
    dt.positive(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(1, schema));
    assert.throws(() => Joi.assert(0, schema));
    assert.throws(() => Joi.assert(-1, schema));
  });

  it('respects nullable property', () => {
    const dt = float();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', () => {
    const dt = float();
    dt.default(10);
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 10);
  });

  it('respects precision property', () => {
    const dt = float();
    dt.precision(3);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(999, schema));
    assert.doesNotThrow(() => Joi.assert(-999, schema));
    assert.throws(() => Joi.assert(9999, schema));
    assert.throws(() => Joi.assert(9999.9, schema));
  });

  it('respects scale property', () => {
    const dt = float();
    dt.scale(2);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(999, schema));
    assert.doesNotThrow(() => Joi.assert(-999, schema));
    assert.doesNotThrow(() => Joi.assert(999.99, schema));
    assert.throws(() => Joi.assert(9.999, schema));
  });

  it('respects precision + scale properties', () => {
    const dt = float();
    dt.precision(5);
    dt.scale(2);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(999.99, schema));
    assert.throws(() => Joi.assert(9999.99, schema));
    assert.throws(() => Joi.assert(999.999, schema));
  });
});
