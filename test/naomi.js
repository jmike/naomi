var chai = require('chai'),
  naomi = require('../src/naomi'),
  Database = require('../src/Database'),
  MySQLDatabase = require('../src/mysql/Database'),
  PostgresDatabase = require('../src/postgres/Database'),
  assert = chai.assert;

describe('naomi', function () {

  describe('#create()', function () {

    it('returns new Database when type is mysql', function () {
      var db = naomi.create('mysql');
      assert.instanceOf(db, Database);
      assert.instanceOf(db, MySQLDatabase);
    });

    it('returns new Database when type is postgres', function () {
      var db = naomi.create('postgres');
      assert.instanceOf(db, Database);
      assert.instanceOf(db, PostgresDatabase);
    });

    it('throws error when type is invalid', function () {
      assert.throws(function () { naomi.create('invalid'); }, /invalid database type/i);
      assert.throws(function () { naomi.create(123); }, /invalid database type/i);
      assert.throws(function () { naomi.create(false); }, /invalid database type/i);
      assert.throws(function () { naomi.create(null); }, /invalid database type/i);
      assert.throws(function () { naomi.create({}); }, /invalid database type/i);
    });

  });

});
