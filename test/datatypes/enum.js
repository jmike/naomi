/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import EnumType from '../../src/datatypes/Enum';

describe('Enum datatype', function() {
  it('accepts string values until values is actually set', function() {
    const dt = new EnumType();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(1.1, schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(true, schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert(new Date(), schema));
  });

  it('respects values property', function() {
    const dt = new EnumType();
    dt.values = ['a', 'b', 'c'];
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('a', schema));
    assert.doesNotThrow(() => Joi.assert('b', schema));
    assert.doesNotThrow(() => Joi.assert('c', schema));
    assert.throws(() => Joi.assert('d', schema));
  });

  it('respects nullable property', function() {
    const dt = new EnumType();
    dt.nullable = true;
    dt.values = ['a', 'b', 'c'];
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = new EnumType();
    dt.default = 'a';
    dt.values = ['a', 'b', 'c'];
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 'a');
  });
});
