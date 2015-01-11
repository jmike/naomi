require('dotenv').load(); // load environmental variables

var chai = require('chai');
var Database = require('../src/Database');
var assert = chai.assert;

describe('Database', function () {

  var db = new Database({database: 'something'});

  describe('@disconnected', function () {

    describe('#isConnected', function () {

      it('returns false', function () {
        assert.strictEqual(db.isConnected, false);
      });

    });

    describe('#query()', function () {

      it('throws error when sql statement is unspecified', function () {
        assert.throws(db.query(), /sql/i);
      });

      // it('throws error when sql statement is Number', function (done) {
      //   db.query(1).catch(function (err) {
      //     assert.match(err, /sql/i);
      //     done();
      //   });
      // });

      // it('throws error when sql statement is Boolean', function (done) {
      //   db.query(true).catch(function (err) {
      //     assert.match(err, /sql/i);
      //     done();
      //   });
      // });

      // it('throws error when sql statement is Object', function (done) {
      //   db.query({}).catch(function (err) {
      //     assert.match(err, /sql/i);
      //     done();
      //   });
      // });

      // it('throws error when sql statement is Array', function (done) {
      //   db.query([]).catch(function (err) {
      //     assert.match(err, /sql/i);
      //     done();
      //   });
      // });

      // it('throws error when sql statement is null', function (done) {
      //   db.query(null).catch(function (err) {
      //     assert.match(err, /sql/i);
      //     done();
      //   });
      // });

      // it('throws error when params array is Number', function (done) {
      //   db.query('SELECT 1;', 1).catch(function (err) {
      //     assert.match(err, /parameters/i);
      //     done();
      //   });
      // });

      // it('throws error when params array is Boolean', function (done) {
      //   db.query('SELECT 1;', true).catch(function (err) {
      //     assert.match(err, /parameters/i);
      //     done();
      //   });
      // });

      // it('throws error when params array is String', function (done) {
      //   db.query('SELECT 1;', 'foo').catch(function (err) {
      //     assert.match(err, /parameters/i);
      //     done();
      //   });
      // });

      // it('throws error when params array is null', function (done) {
      //   db.query('SELECT 1;', null).catch(function (err) {
      //     assert.match(err, /parameters/i);
      //     done();
      //   });
      // });

      // it('throws error when options is Number', function (done) {
      //   db.query('SELECT 1;', [], 1).catch(function (err) {
      //     assert.match(err, /options/i);
      //     done();
      //   });
      // });

      // it('throws error when options is Boolean', function (done) {
      //   db.query('SELECT 1;', [], true).catch(function (err) {
      //     assert.match(err, /options/i);
      //     done();
      //   });
      // });

      // it('throws error when options is String', function (done) {
      //   db.query('SELECT 1;', [], 'foo').catch(function (err) {
      //     assert.match(err, /options/i);
      //     done();
      //   });
      // });

      // it('throws error when options is Array', function (done) {
      //   db.query('SELECT 1;', [], []).catch(function (err) {
      //     assert.match(err, /options/i);
      //     done();
      //   });
      // });

      // it('throws error when options is null', function (done) {
      //   db.query('SELECT 1;', [], null).catch(function (err) {
      //     assert.match(err, /options/i);
      //     done();
      //   });
      // });

      // it('throws a connection error on valid SQL statement', function (done) {
      //   db.query('SELECT 1;').catch(function (err) {
      //     assert.strictEqual(err, 'Connection is closed - did you forget to call #connect()?');
      //     done();
      //   });
      // });

    });

  });

  // describe('#extend()', function () {

  //   it('throws error when table name is unspecified', function () {
  //     assert.throws(function () { db.extend(); });
  //   });

  //   it('throws error when table name is Number', function () {
  //     assert.throws(function () { db.extend(1); });
  //   });

  //   it('throws error when table name is Boolean', function () {
  //     assert.throws(function () { db.extend(true); });
  //   });

  //   it('throws error when table name is Object', function () {
  //     assert.throws(function () { db.extend({}); });
  //   });

  //   it('throws error when table name is Array', function () {
  //     assert.throws(function () { db.extend([]); });
  //   });

  //   it('throws error when table name is null', function () {
  //     assert.throws(function () { db.extend(null); });
  //   });

  // });

});
