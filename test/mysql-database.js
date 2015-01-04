require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  assert = chai.assert,
  db = naomi.create('mysql', {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

describe('MySQL Database', function () {

  before(function (done) {
    db.connect(done);
  });

  after(function (done) {
    db.disconnect(done);
  });

  describe('#isConnected', function () {

    it('returns true', function () {
      assert.strictEqual(db.isConnected, true);
    });

  });

  describe('#hasTable()', function () {

    it('returns true on "employees"', function (done) {
      db.hasTable('employees', function (err, hasTable) {
        if (err) return done(err);
        assert.strictEqual(hasTable, true);
        done();
      });
    });

    it('returns false on "foobar"', function (done) {
      db.hasTable('foobar', function (err, hasTable) {
        if (err) return done(err);
        assert.strictEqual(hasTable, false);
        done();
      });
    });

  });

  describe('#query()', function () {

    it('accepts a single sql param and returns records', function (done) {
      var sql = 'SELECT id FROM `employees`;';
      db.query(sql).then(function (records) {
        assert.isArray(records);
        assert.isObject(records[0]);
        assert.property(records[0], 'id');
        done();
      });
    });

    it('accepts sql + array of params and returns records', function (done) {
      var sql = 'SELECT id FROM `employees` WHERE firstname = ? AND lastname = ?;',
        params = ['Jordan', 'Belfort'];

      db.query(sql, params).then(function (records) {
        assert.isArray(records);
        assert.isObject(records[0]);
        assert.property(records[0], 'id', 1);
        done();
      });
    });

    it('accepts sql + array of params + options and returns records', function (done) {
      var sql = 'SELECT id FROM `employees` WHERE firstname = ? AND lastname = ?;',
        params = ['Jordan', 'Belfort'];

      db.query(sql, params, {nestTables: true}).then(function (records) {
        assert.isArray(records);
        assert.isObject(records[0]);
        assert.isObject(records[0].employees);
        assert.property(records[0].employees, 'id', 1);
        done();
      });
    });

    it('accepts sql + options and returns records', function (done) {
      var sql = 'SELECT 1 AS \'num\';';

      db.query(sql, {nestTables: true}).then(function (records) {
        assert.isArray(records);
        assert.isObject(records[0]);
        assert.isObject(records[0]['']);
        assert.property(records[0][''], 'num', 1);
        done();
      });
    });

  });

});
