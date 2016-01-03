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
        date: {type: 'date', min: new Date(), max: new Date(), format: 'YYYY-mm-dd'},
      }));
    });
  });

  // describe('#connect()', function () {
  //   it('throws error when callback is of invalid type', function () {
  //     const db = new Database({});

  //     assert.throws(() => db.connect(123), TypeError);
  //     assert.throws(() => db.connect(false), TypeError);
  //     assert.throws(() => db.connect('str'), TypeError);
  //     assert.throws(() => db.connect({}), TypeError);
  //   });

  //   it('returns bluebird promise', function () {
  //     const db = new Database({});

  //     assert.instanceOf(db.connect(), Promise);
  //   });

  //   it('accepts callback function', function (done) {
  //     const db = new Database({});

  //     db.connect(done);
  //   });

  //   it('sets @isConnected to true', function () {
  //     const db = new Database({});

  //     assert.isFalse(db.isConnected);
  //     db.connect()
  //       .then(() => assert.isTrue(db.isConnected));
  //   });
  // });

});
