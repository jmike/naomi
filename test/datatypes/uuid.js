/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import uuid from '../../src/datatypes/uuid';

describe('uuid datatype', function() {
  it('asserts UUID value', function() {
    const dt = uuid();
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
    const dt = uuid();
    dt.nullable(true);
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = uuid();
    dt.default('78c332a8-5c2a-458c-a1a7-33fb7af84e1a');
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), '78c332a8-5c2a-458c-a1a7-33fb7af84e1a');
  });

  describe('#nullable()', function() {
    it('accepts boolean value', function() {
      assert.doesNotThrow(() => uuid().nullable(true));
      assert.doesNotThrow(() => uuid().nullable(false));
      assert.throws(() => uuid().nullable('abc'));
      assert.throws(() => uuid().nullable(123));
      assert.throws(() => uuid().nullable(null));
      assert.throws(() => uuid().nullable({}));
      assert.throws(() => uuid().nullable());
    });
  });
});
