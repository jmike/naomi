/* global describe, it */

import {assert} from 'chai';
import Joi from 'joi';
import DateType from '../../src/datatypes/Date';

describe('Date datatype', function() {
  it('accepts date, string and numeric values', function() {
    const dt = new DateType();
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(new Date(), schema));
    assert.doesNotThrow(() => Joi.assert(123, schema));
    assert.doesNotThrow(() => Joi.assert('2016-03-25', schema));
    assert.throws(() => Joi.assert(null, schema));
    assert.throws(() => Joi.assert(true, schema));
    assert.throws(() => Joi.assert({}, schema));
    assert.throws(() => Joi.assert('abc', schema));
  });

  it('respects format property', function() {
    const dt = new DateType();
    dt.format = 'YYYY.MM.DD';
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('2016.03.25', schema));
    assert.doesNotThrow(() => Joi.assert(new Date(), schema));
    assert.throws(() => Joi.assert('2016-03-25', schema));
    assert.throws(() => Joi.assert('abc', schema));
  });

  it('respects min property', function() {
    const dt = new DateType();
    dt.min = '2016-03-01';
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('2016-03-01', schema));
    assert.doesNotThrow(() => Joi.assert('2100-10-01', schema));
    assert.throws(() => Joi.assert('2016-02-29', schema));
  });

  it('respects max property', function() {
    const dt = new DateType();
    dt.max = '2016-03-25';
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert('2016-03-25', schema));
    assert.doesNotThrow(() => Joi.assert('2010-10-22', schema));
    assert.throws(() => Joi.assert('2016-03-26', schema));
  });

  it('respects nullable property', function() {
    const dt = new DateType();
    dt.nullable = true;
    const schema = dt.toJoi();

    assert.doesNotThrow(() => Joi.assert(null, schema));
    assert.doesNotThrow(() => Joi.assert(undefined, schema));
  });

  it('respects default property', function() {
    const dt = new DateType();
    dt.default = '2015-03-25';
    const schema = dt.toJoi();

    assert.strictEqual(Joi.attempt(undefined, schema), '2015-03-25');
  });

  it('accepts function as default value', function() {
    const dt = new DateType();
    dt.default = Date.now;
    const schema = dt.toJoi();

    assert.isNumber(Joi.attempt(undefined, schema));
    assert.approximately(Joi.attempt(undefined, schema), Date.now(), 10); // Date.now() +/- 10 ms
  });
});
