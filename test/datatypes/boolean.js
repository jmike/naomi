/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import BooleanType from '../../src/datatypes/Boolean';

describe('Boolean datatype', function() {
  it('accepts boolean', function() {
    const dt = new BooleanType();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(true, schema));
    assert.doesNotThrow(() => Joi.assert(false, schema));
    assert.throws(() => Joi.assert('str', schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(new Date(), schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert('abc', schema));
  });

  // it('accepts strings "true", "false", "yes", "no", "on" or "off"', function() {
  //   const dt = new BooleanType();
  //   const schema = dt.toJoi();

  //   assert.doesNotThrow(() => Joi.assert('true', schema));
  //   assert.doesNotThrow(() => Joi.assert('false', schema));
  //   assert.doesNotThrow(() => Joi.assert('yes', schema));
  //   assert.doesNotThrow(() => Joi.assert('no', schema));
  //   assert.doesNotThrow(() => Joi.assert('on', schema));
  //   assert.doesNotThrow(() => Joi.assert('off', schema));
  // });

  it('respects nullable property', function() {
    const dt = new BooleanType();
    dt.nullable = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = new BooleanType();
    dt.default = true;
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), true);
  });

  it('respects default property even when it\'s falsy', function() {
    const dt = new BooleanType();
    dt.default = false;
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), false);
  });
});
