require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var naomi = require('../src/naomi');

describe('Postgres Database', function () {

  var db = naomi.create('postgres', {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
  });

  describe('@disconnected', function () {

    describe('#query()', function () {

      it('throws error when sql statement is unspecified', function () {
        assert.throws(function () { db.query(); }, /invalid sql argument/i);
      });

      it('throws error when sql statement is Number', function () {
        assert.throws(function () { db.query(-1); }, /invalid sql argument/i);
        assert.throws(function () { db.query(0); }, /invalid sql argument/i);
        assert.throws(function () { db.query(1); }, /invalid sql argument/i);
      });

      it('throws error when sql statement is Boolean', function () {
        assert.throws(function () { db.query(true); }, /invalid sql argument/i);
        assert.throws(function () { db.query(false); }, /invalid sql argument/i);
      });

      it('throws error when sql statement is Object', function () {
        assert.throws(function () { db.query({}); }, /invalid sql argument/i);
      });

      it('throws error when sql statement is Array', function () {
        assert.throws(function () { db.query([]); }, /invalid sql argument/i);
      });

      it('throws error when sql statement is null', function () {
        assert.throws(function () { db.query(null); }, /invalid sql argument/i);
      });

      it('throws error when params is Number', function () {
        assert.throws(function () { db.query('sql', -1); }, /invalid params argument/i);
        assert.throws(function () { db.query('sql', 0); }, /invalid params argument/i);
        assert.throws(function () { db.query('sql', 1); }, /invalid params argument/i);
      });

      it('throws error when params is Boolean', function () {
        assert.throws(function () { db.query('sql', true); }, /invalid params argument/i);
        assert.throws(function () { db.query('sql', false); }, /invalid params argument/i);
      });

      it('throws error when params is String', function () {
        assert.throws(function () { db.query('sql', ''); }, /invalid params argument/i);
      });

      it('throws error when params is null', function () {
        assert.throws(function () { db.query('sql', null); }, /invalid params argument/i);
      });

      it('throws error when options is Number', function () {
        assert.throws(function () { db.query('sql', [], -1); }, /invalid options argument/i);
        assert.throws(function () { db.query('sql', [], 0); }, /invalid options argument/i);
        assert.throws(function () { db.query('sql', [], 1); }, /invalid options argument/i);
      });

      it('throws error when options is Boolean', function () {
        assert.throws(function () { db.query('sql', [], true); }, /invalid options argument/i);
        assert.throws(function () { db.query('sql', [], false); }, /invalid options argument/i);
      });

      it('throws error when options is String', function () {
        assert.throws(function () { db.query('sql', [], ''); }, /invalid options argument/i);
      });

      it('throws error when options is Array', function () {
        assert.throws(function () { db.query('sql', [], []); }, /invalid options argument/i);
      });

      it('throws error when options is null', function () {
        assert.throws(function () { db.query('sql', [], null); }, /invalid options argument/i);
      });

    });

    describe('#hasTable()', function () {

      it('throws error when table is unspecified', function () {
        assert.throws(function () { db.hasTable(); }, /invalid table argument/i);
      });

      it('throws error when table is Number', function () {
        assert.throws(function () { db.hasTable(-1); }, /invalid table argument/i);
        assert.throws(function () { db.hasTable(0); }, /invalid table argument/i);
        assert.throws(function () { db.hasTable(1); }, /invalid table argument/i);
      });

      it('throws error when table is Boolean', function () {
        assert.throws(function () { db.hasTable(true); }, /invalid table argument/i);
        assert.throws(function () { db.hasTable(false); }, /invalid table argument/i);
      });

      it('throws error when table is Object', function () {
        assert.throws(function () { db.hasTable({}); }, /invalid table argument/i);
      });

      it('throws error when table is Array', function () {
        assert.throws(function () { db.hasTable([]); }, /invalid table argument/i);
      });

      it('throws error when table is null', function () {
        assert.throws(function () { db.hasTable(null); }, /invalid table argument/i);
      });

    });

  });

  describe('@connected', function () {

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

      it('returns records on sql', function (done) {
        var sql = 'SELECT id FROM "employees";';

        db.query(sql)
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.property(records[0], 'id');
            done();
          });
      });

      it('returns records on sql + params', function (done) {
        var sql = 'SELECT id FROM "employees" WHERE firstname = ? AND lastname = ?;';
        var params = ['Jordan', 'Belfort'];

        db.query(sql, params)
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.property(records[0], 'id', 1);
            done();
          });
      });

    });

  });

});
