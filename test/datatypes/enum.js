/* eslint-env node, mocha */

import { assert } from 'chai';
import Joi from 'joi';
import EnumType from '../../src/datatypes/Enum';

describe('Enum datatype', () => {
  it('asserts string value until values prop is defined', () => {
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

  it('respects values property', () => {
    const dt = new EnumType();
    dt.values('a', 'b', 'c');
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('a', schema));
    assert.doesNotThrow(() => Joi.assert('b', schema));
    assert.doesNotThrow(() => Joi.assert('c', schema));
    assert.throws(() => Joi.assert('d', schema));
  });

  it('respects nullable property', () => {
    const dt = new EnumType();
    dt.nullable(true);
    dt.values(['a', 'b', 'c']);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', () => {
    const dt = new EnumType();
    dt.default('a');
    dt.values(['a', 'b', 'c']);
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), 'a');
  });

  describe('#values', () => {
    it('accepts Array<string> or multiple string arguments', () => {
      assert.doesNotThrow(() => new EnumType().values('a'));
      assert.doesNotThrow(() => new EnumType().values('a', 'b', 'c'));
      assert.doesNotThrow(() => new EnumType().values(['a', 'b', 'c']));
      assert.throws(() => new EnumType().values(false));
      assert.throws(() => new EnumType().values(123));
      assert.throws(() => new EnumType().values(null));
      assert.throws(() => new EnumType().values({}));
      assert.throws(() => new EnumType().values());
    });
  });

  describe('#nullable', () => {
    it('accepts boolean value', () => {
      assert.doesNotThrow(() => new EnumType().nullable(true));
      assert.doesNotThrow(() => new EnumType().nullable(false));
      assert.throws(() => new EnumType().nullable('abc'));
      assert.throws(() => new EnumType().nullable(123));
      assert.throws(() => new EnumType().nullable(null));
      assert.throws(() => new EnumType().nullable({}));
      assert.throws(() => new EnumType().nullable());
    });
  });
});
