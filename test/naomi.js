var assert = require('chai').assert;
var naomi = require('../src/naomi');
var Database = require('../src/Database');
var MySQLDatabase = require('../src/mysql/Database');
var PostgresDatabase = require('../src/postgres/Database');

describe('naomi', function () {

  describe('#create()', function () {

    it('throws error when engine is invalid', function () {
      assert.throws(function () { naomi.create(123); }, /invalid engine argument/i);
      assert.throws(function () { naomi.create(false); }, /invalid engine argument/i);
      assert.throws(function () { naomi.create(null); }, /invalid engine argument/i);
      assert.throws(function () { naomi.create({}); }, /invalid engine argument/i);
      assert.throws(function () { naomi.create(new Date()); }, /invalid engine argument/i);
    });

    it('throws error when engine is unknown', function () {
      assert.throws(function () { naomi.create('unknown'); }, /unknown engine/i);
    });

    it('returns new Database when type is mysql', function () {
      var db = naomi.create('mysql');
      assert.instanceOf(db, MySQLDatabase);
    });

    it('returns new Database when type is postgres', function () {
      var db = naomi.create('postgres');
      assert.instanceOf(db, PostgresDatabase);
    });

    it('throws error when props is invalid', function () {
      assert.throws(function () { naomi.create('mysql', 123); }, /invalid props argument/i);
      assert.throws(function () { naomi.create('mysql', false); }, /invalid props argument/i);
      assert.throws(function () { naomi.create('mysql', null); }, /invalid props argument/i);
      assert.throws(function () { naomi.create('mysql', 'string'); }, /invalid props argument/i);
      assert.throws(function () { naomi.create('mysql', new Date()); }, /invalid props argument/i);
    });

    it('loads MySQL connection properties from environmental variables', function () {
      var db = naomi.create('mysql');
      assert.strictEqual(db.connectionProperties.host, process.env.MYSQL_HOST);
      assert.equal(db.connectionProperties.port, process.env.MYSQL_PORT);
      assert.strictEqual(db.connectionProperties.user, process.env.MYSQL_USER);
      assert.strictEqual(db.connectionProperties.password, process.env.MYSQL_PASSWORD || '');
      assert.strictEqual(db.connectionProperties.database, process.env.MYSQL_DATABASE);
    });

    it('loads Postgres connection properties from environmental variables', function () {
      var db = naomi.create('postgres');
      assert.strictEqual(db.connectionProperties.host, process.env.POSTGRES_HOST);
      assert.equal(db.connectionProperties.port, process.env.POSTGRES_PORT);
      assert.strictEqual(db.connectionProperties.user, process.env.POSTGRES_USER);
      assert.strictEqual(db.connectionProperties.password, process.env.POSTGRES_PASSWORD || '');
      assert.strictEqual(db.connectionProperties.database, process.env.POSTGRES_DATABASE);
    });

  });

});
