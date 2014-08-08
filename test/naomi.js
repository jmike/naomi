var chai = require('chai'),
  naomi = require('../src/naomi'),
  MySQLEngine = require('../src/MySQLEngine'),
  // PostgresEngine = require('../src/PostgresEngine'),
  assert = chai.assert;

describe('naomi', function () {

  describe('#create()', function () {

    it('throws an error when database type is unspecified', function () {
      assert.throws(function () {
        naomi.create('');
      }, /invalid or unspecified database type/i);
    });

    it('throws an error when database type is invalid', function () {
      assert.throws(function () {
        naomi.create('invalid');
      }, /invalid or unspecified database type/i);
      assert.throws(function () {
        naomi.create(123);
      }, /invalid or unspecified database type/i);
      assert.throws(function () {
        naomi.create(false);
      }, /invalid or unspecified database type/i);
      assert.throws(function () {
        naomi.create({});
      }, /invalid or unspecified database type/i);
    });

    it('returns a new MySQL Database when "mysql" type is specified', function () {
      var db = naomi.create('mysql');
      assert.instanceOf(db._engine, MySQLEngine);
    });

    it('accepts type param in both uppercase and lowercase letters, e.g. "MySQL"', function () {
      var db = naomi.create('MySQL');
      assert.instanceOf(db._engine, MySQLEngine);
    });

    // it('returns a new POSTGRES Database', function () {
    //   var db = naomi.create('POSTGRES');
    //   assert.instanceOf(db._engine, PostgresEngine);
    // });

  });

});
