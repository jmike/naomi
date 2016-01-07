/* global describe, it */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Promise from 'bluebird';
import Schema from '../src/Schema';

chai.use(chaiAsPromised);
const assert = chai.assert;

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
      assert.isTrue(obj.isJoi);
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

      assert.isFulfilled(schema.validate({x: 1}));
      assert.isRejected(schema.validate({x: '1'}));
    });

    it('successfully validates string', function () {
      const schema = new Schema({
        x: {type: 'string', minLength: 2}
      });

      assert.isFulfilled(schema.validate({x: 'abc'}));
      assert.isRejected(schema.validate({x: 'a'}));
      assert.isRejected(schema.validate({x: 123}));
    });

    it('successfully validates date', function () {
      const schema = new Schema({
        x: {type: 'date', format: 'YYYY-MM-DD'}
      });

      assert.isFulfilled(schema.validate({x: '2016-02-04'}));
      assert.isRejected(schema.validate({x: 'a'}));
    });

    it('successfully validates integer', function () {
      const schema = new Schema({
        x: {type: 'integer'}
      });

      assert.isFulfilled(schema.validate({x: 123}));
      assert.isRejected(schema.validate({x: 123.52}));
    });

    it('successfully validates float', function () {
      const schema = new Schema({
        x: {type: 'float', precision: 2}
      });

      assert.isFulfilled(schema.validate({x: 123.2}));
      assert.isRejected(schema.validate({x: 'abc'}), Error);
      assert.isRejected(schema.validate({x: 123.3342}), Error);
    });

    it('successfully validates uuid', function () {
      const schema = new Schema({
        x: {type: 'uuid'}
      });

      assert.isFulfilled(schema.validate({x: '8f06601c-5ba5-411f-bfd1-0875bdb0a3bc'}));
      assert.isRejected(schema.validate({x: 'abc'}), Error);
      assert.isRejected(schema.validate({x: 123}), Error);
    });

    it('successfully validates enum', function () {
      const schema = new Schema({
        x: {type: 'enum', values: ['a', 'b', 'c']}
      });

      assert.isFulfilled(schema.validate({x: 'b'}));
      assert.isRejected(schema.validate({x: 'd'}), Error);
      assert.isRejected(schema.validate({x: 123}), Error);
    });
  });
});
