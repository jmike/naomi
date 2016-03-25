/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import boolean from '../../src/datatypes/boolean';

describe('boolean datatype', function() {
  it('asserts boolean value', function() {
    const dt = boolean();
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

  it('respects nullable property', function() {
    const dt = boolean();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = boolean();
    dt.default(true);
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), true);
  });

  it('respects default property even when it\'s falsy', function() {
    const dt = boolean();
    dt.default(false);
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), false);
  });

  // it('accepts strings "true", "false", "yes", "no", "on" or "off"', function() {
  //   const dt = boolean();
  //   const schema = dt.toJoi();

  //   assert.doesNotThrow(() => Joi.assert('true', schema));
  //   assert.doesNotThrow(() => Joi.assert('false', schema));
  //   assert.doesNotThrow(() => Joi.assert('yes', schema));
  //   assert.doesNotThrow(() => Joi.assert('no', schema));
  //   assert.doesNotThrow(() => Joi.assert('on', schema));
  //   assert.doesNotThrow(() => Joi.assert('off', schema));
  // });

  describe('#nullable()', function() {
    it('accepts boolean value', function() {
      assert.doesNotThrow(() => boolean().nullable(true));
      assert.doesNotThrow(() => boolean().nullable(false));
      assert.throws(() => boolean().nullable('abc'));
      assert.throws(() => boolean().nullable(123));
      assert.throws(() => boolean().nullable(null));
      assert.throws(() => boolean().nullable({}));
      assert.throws(() => boolean().nullable());
    });
  });
});
