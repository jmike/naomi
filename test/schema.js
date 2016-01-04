/* global describe, it */

import {assert} from 'chai';
import Promise from 'bluebird';
import Schema from '../src/Schema';

describe('Schema', function () {
  describe('#constructor()', function () {
    it('throws error when definition is unspecified', function () {
      assert.throws(() => new Schema(), TypeError);
    });

    it('throws error when definition is of invalid type', function () {
      assert.throws(() => new Schema(123), TypeError);
      assert.throws(() => new Schema(false), TypeError);
      assert.throws(() => new Schema(null), TypeError);
      assert.throws(() => new Schema('str'), TypeError);
    });

    it('accepts datatypes in definition schema', function () {
      assert.doesNotThrow(() => new Schema({
        uuid: {type: 'uuid'},
        string: {type: 'string', minLength: 1, maxLength: 10, lowercase: true},
        enum: {type: 'enum', values: ['a', 'b', 'c']},
        number: {type: 'number', min: -10, max: 10, positive: true},
        float: {type: 'float', min: -10, max: 10, positive: true, precision: 2},
        integer: {type: 'integer', min: -10, max: 10, positive: true},
        date: {type: 'date', min: new Date(), max: new Date(), format: 'YYYY-MM-DD'},
      }));
    });
  });

  describe('#toJSON()', function () {
    const schema = new Schema({
      id: {type: 'number'}
    });

    it('returns plain object', function () {
      assert.isObject(schema.toJSON());
    });
  });

  describe('#toJoi()', function () {
    const schema = new Schema({
      id: {type: 'number'}
    });

    it('returns object with Joi functions', function () {
      const obj = schema.toJoi();

      assert.isObject(obj);
      assert.isTrue(obj.id.isJoi);
    });
  });

  describe('#validate()', function () {
    it('returns bluebird promise', function () {
      const schema = new Schema({
        id: {type: 'number'}
      });

      assert.instanceOf(schema.validate({id: 1}), Promise);
    });

    it('accepts callback function', function (done) {
      const schema = new Schema({
        id: {type: 'number'}
      });

      schema.validate({id: 1}, done);
    });

    it('successfully validates number', function () {
      const schema = new Schema({
        x: {type: 'number', min: 0}
      });

      schema.validate({x: 1})
        .then((result) => assert.isUndefined(result));

      schema.validate({x: '1'})
        .catch((err) => {
          assert.instanceOf(err, Error);
          assert.strictEqual(err.name, 'ValidationError');
        });
    });

    it('successfully validates string', function () {
      const schema = new Schema({
        x: {type: 'string', minLength: 2}
      });

      schema.validate({x: 'abc'})
        .then((result) => assert.isUndefined(result));

      schema.validate({x: 'a'})
        .catch((err) => {
          assert.instanceOf(err, Error);
          assert.strictEqual(err.name, 'ValidationError');
        });

      schema.validate({x: 123})
        .catch((err) => {
          assert.instanceOf(err, Error);
          assert.strictEqual(err.name, 'ValidationError');
        });
    });

    it('successfully validates date', function () {
      const schema = new Schema({
        x: {type: 'date', format: 'YYYY-MM-DD'}
      });

      schema.validate({x: '2016-02-04'})
        .then((result) => assert.isUndefined(result));

      schema.validate({x: 'a'})
        .catch((err) => {
          assert.instanceOf(err, Error);
          assert.strictEqual(err.name, 'ValidationError');
        });
    });

    it('successfully validates integer', function () {
      const schema = new Schema({
        x: {type: 'integer'}
      });

      schema.validate({x: 123})
        .then((result) => assert.isUndefined(result));

      schema.validate({x: 123.52})
        .catch((err) => {
          assert.instanceOf(err, Error);
          assert.strictEqual(err.name, 'ValidationError');
        });
    });

    it('successfully validates float', function () {
      const schema = new Schema({
        x: {type: 'float', precision: 2}
      });

      schema.validate({x: 123.2})
        .then((result) => assert.isUndefined(result));

      schema.validate({x: 'abc'})
        .catch((err) => {
          assert.instanceOf(err, Error);
          assert.strictEqual(err.name, 'ValidationError');
        });
    });
  });
});
