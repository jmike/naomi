/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import enumType from '../../src/datatypes/enum';

describe('enum datatype', function() {
  it('asserts string value until values prop is defined', function() {
    const dt = enumType();
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
    const dt = enumType();
    dt.values('a', 'b', 'c');
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('a', schema));
    assert.doesNotThrow(() => Joi.assert('b', schema));
    assert.doesNotThrow(() => Joi.assert('c', schema));
    assert.throws(() => Joi.assert('d', schema));
  });

  it('respects nullable property', function() {
    const dt = enumType();
    dt.nullable(true);
    dt.values(['a', 'b', 'c']);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = enumType();
    dt.default('a');
    dt.values(['a', 'b', 'c']);
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 'a');
  });

  describe('#values', function () {
    it('accepts Array<string> or multiple string arguments', function() {
      assert.doesNotThrow(() => enumType().values('a'));
      assert.doesNotThrow(() => enumType().values('a', 'b', 'c'));
      assert.doesNotThrow(() => enumType().values(['a', 'b', 'c']));
      assert.throws(() => enumType().values(false));
      assert.throws(() => enumType().values(123));
      assert.throws(() => enumType().values(null));
      assert.throws(() => enumType().values({}));
      assert.throws(() => enumType().values());
    });
  });

  describe('#nullable', function () {
    it('accepts boolean value', function() {
      assert.doesNotThrow(() => enumType().nullable(true));
      assert.doesNotThrow(() => enumType().nullable(false));
      assert.throws(() => enumType().nullable('abc'));
      assert.throws(() => enumType().nullable(123));
      assert.throws(() => enumType().nullable(null));
      assert.throws(() => enumType().nullable({}));
      assert.throws(() => enumType().nullable());
    });
  });
});
