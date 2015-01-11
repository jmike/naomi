require('dotenv').load(); // load environmental variables

var chai = require('chai');
var naomi = require('../src/naomi');
var assert = chai.assert;

describe('Postgres Database', function () {

  var db = naomi.create('postgres', {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
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
