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

    it('loads MySQL connection properties from environmental variables', function () {
      var db = naomi.create('mysql');
      assert.strictEqual(db.connectionProperties.host, process.env.MYSQL_HOST);
      assert.equal(db.connectionProperties.port, process.env.MYSQL_PORT);
      assert.strictEqual(db.connectionProperties.user, process.env.MYSQL_USER);
      assert.strictEqual(db.connectionProperties.password, process.env.MYSQL_PASSWORD || '');
      assert.strictEqual(db.connectionProperties.database, process.env.MYSQL_DATABASE);
    });

    it('returns new Database when type is postgres', function () {
      var db = naomi.create('postgres');
      assert.instanceOf(db, Database);
      assert.instanceOf(db, PostgresDatabase);
    });

    it('loads Postgres connection properties from environmental variables', function () {
      var db = naomi.create('postgres');
      assert.strictEqual(db.connectionProperties.host, process.env.POSTGRES_HOST);
      assert.equal(db.connectionProperties.port, process.env.POSTGRES_PORT);
      assert.strictEqual(db.connectionProperties.user, process.env.POSTGRES_USER);
      assert.strictEqual(db.connectionProperties.password, process.env.POSTGRES_PASSWORD || '');
      assert.strictEqual(db.connectionProperties.database, process.env.POSTGRES_DATABASE);
    });

    it('throws error when type is invalid', function () {
      assert.throws(function () { naomi.create('invalid'); }, /database type must be one of mysql, postgres/i);
      assert.throws(function () { naomi.create(123); }, /database type must be a string/i);
      assert.throws(function () { naomi.create(false); }, /database type must be a string/i);
      assert.throws(function () { naomi.create(null); }, /database type must be a string/i);
      assert.throws(function () { naomi.create({}); }, /database type must be a string/i);
    });

  });

});
