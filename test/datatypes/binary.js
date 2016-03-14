/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import BinaryType from '../../src/datatypes/Binary';

describe('Binary datatype', function() {
  it('accepts buffer', function() {
    const dt = new BinaryType();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]), schema));
    assert.throws(() => Joi.assert('str', schema));
    assert.throws(() => Joi.assert(123, schema));
    assert.throws(() => Joi.assert(1.1, schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(true, schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert(new Date(), schema));
  });

  it('respects length property', function() {
    const dt = new BinaryType();
    dt.length = 3;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2, 3, 4]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2]), schema));
  });

  it('respects maxLength property', function() {
    const dt = new BinaryType();
    dt.maxLength = 3;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3]), schema));
    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2, 3, 4]), schema));
  });

  it('respects minLength property', function() {
    const dt = new BinaryType();
    dt.minLength = 3;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3]), schema));
    assert.doesNotThrow(() => Joi.assert(new Buffer([1, 2, 3, 4]), schema));
    assert.throws(() => Joi.assert(new Buffer([1, 2]), schema));
  });

  it('respects nullable property', function() {
    const dt = new BinaryType();
    dt.nullable = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = new BinaryType();
    const buf = new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
    dt.default = buf;
    const schema = dt.toJoi();

    assert.strictEqual(buf.compare(Joi.attempt(undefined, schema)), 0);
  });
});
