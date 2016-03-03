/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import UUIDType from '../../src/datatypes/UUID';

describe('UUID datatype', function() {
  it('accepts UUID values', function() {
    const dt = new UUIDType();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('78c332a8-5c2a-458c-a1a7-33fb7af84e1a', schema));
    assert.throws(() => Joi.assert('abc', schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(1.1, schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(true, schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert(new Date(), schema));
  });

  it('respects nullable property', function() {
    const dt = new UUIDType();
    dt.nullable = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = new UUIDType();
    dt.default = '78c332a8-5c2a-458c-a1a7-33fb7af84e1a';
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), '78c332a8-5c2a-458c-a1a7-33fb7af84e1a');
  });
});
