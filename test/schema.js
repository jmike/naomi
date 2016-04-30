/* eslint-env node, mocha */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Promise from 'bluebird';
import Schema from '../src/Schema';

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('Schema', () => {
  describe('#constructor()', () => {
    it('throws error when definition is unspecified', () => {
      assert.throws(() => new Schema(), TypeError);
    });

    it('throws error when definition is invalid', () => {
      assert.throws(() => new Schema(123), TypeError);
      assert.throws(() => new Schema(false), TypeError);
      assert.throws(() => new Schema(null), TypeError);
      assert.throws(() => new Schema('str'), TypeError);
    });

    it('accepts empty definition object', () => {
      assert.doesNotThrow(() => new Schema({}));
    });

    it('accepts Naomi datatypes', () => {
      assert.doesNotThrow(() => new Schema({
        uuid: { type: 'uuid' },
        string: { type: 'string', minLength: 1, maxLength: 10, lowercase: true },
        enum: { type: 'enum', values: ['a', 'b', 'c'] },
        number: { type: 'number', min: -10, max: 10, positive: true },
        float: { type: 'float', min: -10, max: 10, positive: true, precision: 5, scale: 2 },
        integer: { type: 'integer', min: -10, max: 10, positive: true },
        date: { type: 'date', min: '1970-01-01', max: '2016-03-25', format: 'YYYY-MM-DD' },
      }));
    });
  });

  describe('#index()', () => {
    const schema = new Schema({
      id: { type: 'integer' },
      firstname: { type: 'string' },
      lastname: { type: 'string' },
      email: { type: 'string' },
      age: { type: 'string' },
    });

    it('throws error when keys is unspecified', () => {
      assert.throws(() => schema.index(), TypeError);
    });

    it('throws error when keys is invalid', () => {
      assert.throws(() => schema.index(123), TypeError);
      assert.throws(() => schema.index(false), TypeError);
      assert.throws(() => schema.index(null), TypeError);
      assert.throws(() => schema.index('str'), TypeError);
      assert.throws(() => schema.index(new Date()), TypeError);
    });

    it('handles primary key', () => {
      schema.index({ id: 1 }, { type: 'primary' });
      assert.isTrue(schema.isPrimaryKey('id'));
    });

    it('handles unique key', () => {
      schema.index({ email: 1 }, { type: 'unique', name: 'uidx_email' });
      assert.isTrue(schema.isUniqueKey('email'));
    });

    it('handles index key', () => {
      schema.index({ age: -1 }, { name: 'idx_age' });
      assert.isTrue(schema.isIndexKey('age'));
    });

    it('handles compound index key', () => {
      schema.index({ firstname: 1, lastname: 1 }, { name: 'idx_name' });
      assert.isTrue(schema.isIndexKey('firstname', 'lastname'));
      assert.isFalse(schema.isIndexKey('foobar'));
      assert.isFalse(schema.isIndexKey('firstname', 'foobar'));
      assert.isFalse(schema.isIndexKey('firstname', 'lastname', 'foobar'));
    });
  });

  describe('#hasAutoIncPrimaryKey()', () => {
    it('returns true when primary key is composed of a single auto-incremented key', () => {
      const schema = new Schema({
        id: { type: 'integer', autoinc: true }
      });

      schema.index({ id: 1 }, { type: 'primary' });

      assert.isTrue(schema.hasAutoIncPrimaryKey());
    });

    it('returns false when primary key is not auto-incremented', () => {
      const schema = new Schema({
        id: { type: 'integer' }
      });

      schema.index({ id: 1 }, { type: 'primary' });

      assert.isFalse(schema.hasAutoIncPrimaryKey());
    });

    it('returns false when primary key is not defined', () => {
      const schema = new Schema({
        id: { type: 'integer' }
      });

      assert.isFalse(schema.hasAutoIncPrimaryKey());
    });
  });

  describe('#toJSON()', () => {
    const schema = new Schema({
      id: { type: 'number' }
    });

    it('returns plain object', () => {
      assert.isObject(schema.toJSON());
    });
  });

  describe('#toJoi()', () => {
    const schema = new Schema({
      id: { type: 'number' }
    });

    it('returns Joi object', () => {
      const obj = schema.toJoi();

      assert.isObject(obj);
      assert.isTrue(obj.isJoi);
    });
  });

  describe('#validate()', () => {
    it('returns bluebird promise', () => {
      const schema = new Schema({
        id: { type: 'number' }
      });

      assert.instanceOf(schema.validate({ id: 1 }), Promise);
    });

    it('accepts callback function', (done) => {
      const schema = new Schema({
        id: { type: 'number' }
      });

      schema.validate({ id: 1 }, done);
    });

    it('successfully validates number', () => {
      const schema = new Schema({
        x: { type: 'number', min: 0 }
      });

      assert.isFulfilled(schema.validate({ x: 1 }));
      assert.isRejected(schema.validate({ x: '1' }));
    });

    it('successfully validates string', () => {
      const schema = new Schema({
        x: { type: 'string', minLength: 2 }
      });

      assert.isFulfilled(schema.validate({ x: 'abc' }));
      assert.isRejected(schema.validate({ x: 'a' }));
      assert.isRejected(schema.validate({ x: 123 }));
    });

    it('successfully validates date', () => {
      const schema = new Schema({
        x: { type: 'date', format: 'YYYY-MM-DD' }
      });

      assert.isFulfilled(schema.validate({ x: '2016-02-04' }));
      assert.isRejected(schema.validate({ x: 'a' }));
    });

    it('successfully validates integer', () => {
      const schema = new Schema({
        x: { type: 'integer' }
      });

      assert.isFulfilled(schema.validate({ x: 123 }));
      assert.isRejected(schema.validate({ x: 123.52 }));
    });

    it('successfully validates float', () => {
      const schema = new Schema({
        x: { type: 'float', precision: 5, scale: 2 }
      });

      assert.isFulfilled(schema.validate({ x: 123.2 }));
      assert.isRejected(schema.validate({ x: 'abc' }), Error);
      assert.isRejected(schema.validate({ x: 123.3342 }), Error);
    });

    it('successfully validates uuid', () => {
      const schema = new Schema({
        x: { type: 'uuid' }
      });

      assert.isFulfilled(schema.validate({ x: '8f06601c-5ba5-411f-bfd1-0875bdb0a3bc' }));
      assert.isRejected(schema.validate({ x: 'abc' }), Error);
      assert.isRejected(schema.validate({ x: 123 }), Error);
    });

    it('successfully validates enum', () => {
      const schema = new Schema({
        x: { type: 'enum', values: ['a', 'b', 'c'] }
      });

      assert.isFulfilled(schema.validate({ x: 'b' }));
      assert.isRejected(schema.validate({ x: 'd' }), Error);
      assert.isRejected(schema.validate({ x: 123 }), Error);
    });
  });
});
