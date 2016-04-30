/* eslint-env node, mocha */

import { assert } from 'chai';
import Joi from 'joi';
import number from '../../src/datatypes/number';

describe('number datatype', () => {
  it('asserts numeric value', () => {
    const dt = number();
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
    const dt = number();
    dt.min(100);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(100, schema));
    assert.throws(() => Joi.assert(99, schema));
  });

  it('respects max property', () => {
    const dt = number();
    dt.max(100);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(100, schema));
    assert.throws(() => Joi.assert(101, schema));
  });

  it('respects negative property', () => {
    const dt = number();
    dt.negative(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(-1, schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(0, schema));
  });

  it('respects positive property', () => {
    const dt = number();
    dt.positive(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(1, schema));
    assert.throws(() => Joi.assert(0, schema));
    assert.throws(() => Joi.assert(-1, schema));
  });

  it('respects nullable property', () => {
    const dt = number();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', () => {
    const dt = number();
    dt.default(10);
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 10);
  });
});
