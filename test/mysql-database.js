require('dotenv').load(); // load environmental variables

var chai = require('chai');
var assert = chai.assert;
var naomi = require('../src/naomi');

describe('MySQL Database', function () {

  var db = naomi.create('mysql', {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  describe('@disconnected', function () {

    describe('#isConnected', function () {

      it('returns false', function () {
        assert.strictEqual(db.isConnected, false);
      });

    });

    describe('#query()', function () {

      it('throws error when sql statement is unspecified', function () {
        assert.throws(function () {
          db.query();
        }, 'Invalid sql argument; expected string, received undefined');
      });

      it('throws error when sql statement is Number', function () {
        assert.throws(function () {
          db.query(1);
        }, 'Invalid sql argument; expected string, received number');
      });

      it('throws error when sql statement is Boolean', function () {
        assert.throws(function () {
          db.query(true);
        }, 'Invalid sql argument; expected string, received boolean');
      });

      it('throws error when sql statement is Object', function () {
        assert.throws(function () {
          db.query({});
        }, 'Invalid sql argument; expected string, received object');
      });

      it('throws error when sql statement is Array', function () {
        assert.throws(function () {
          db.query([]);
        }, 'Invalid sql argument; expected string, received object');
      });

      it('throws error when sql statement is null', function () {
        assert.throws(function () {
          db.query(null);
        }, 'Invalid sql argument; expected string, received object');
      });

      it('throws error when params is Number', function () {
        assert.throws(function () {
          db.query('SELECT 1;', 1);
        }, 'Invalid params argument; expected array, received number');
      });

      it('throws error when params is Boolean', function () {
        assert.throws(function () {
          db.query('SELECT 1;', true);
        }, 'Invalid params argument; expected array, received boolean');
      });

      it('throws error when params is String', function () {
        assert.throws(function () {
          db.query('SELECT 1;', '');
        }, 'Invalid params argument; expected array, received string');
      });

      it('throws error when params is null', function () {
        assert.throws(function () {
          db.query('SELECT 1;', null);
        }, 'Invalid params argument; expected array, received object');
      });

      it('throws error when options is Number', function () {
        assert.throws(function () {
          db.query('SELECT 1;', [], 1);
        }, 'Invalid options argument; expected object, received number');
      });

      it('throws error when options is Boolean', function () {
        assert.throws(function () {
          db.query('SELECT 1;', [], true);
        }, 'Invalid options argument; expected object, received boolean');
      });

      it('throws error when options is String', function () {
        assert.throws(function () {
          db.query('SELECT 1;', [], '');
        }, 'Invalid options argument; expected object, received string');
      });

      it('throws error when options is Array', function () {
        assert.throws(function () {
          db.query('SELECT 1;', [], []);
        }, 'Invalid options argument; expected object, received object');
      });

      it('throws error when options is null', function () {
        assert.throws(function () {
          db.query('SELECT 1;', [], null);
        }, 'Invalid options argument; expected object, received object');
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
        var sql = 'SELECT id FROM `employees`;';

        db.query(sql)
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.property(records[0], 'id');
            done();
          });
      });

      it('returns records on sql + params', function (done) {
        var sql = 'SELECT id FROM `employees` WHERE firstname = ? AND lastname = ?;';
        var params = ['Jordan', 'Belfort'];

        db.query(sql, params)
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.property(records[0], 'id', 1);
            done();
          });
      });

      it('returns records on sql + params + options', function (done) {
        var sql = 'SELECT id FROM `employees` WHERE firstname = ? AND lastname = ?;';
        var params = ['Jordan', 'Belfort'];

        db.query(sql, params, {nestTables: true})
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.isObject(records[0].employees);
            assert.property(records[0].employees, 'id', 1);
            done();
          });
      });

      it('returns records on sql + options', function (done) {
        var sql = 'SELECT 1 AS \'num\';';

        db.query(sql, {nestTables: true})
          .then(function (records) {
            assert.isArray(records);
            assert.isObject(records[0]);
            assert.isObject(records[0]['']);
            assert.property(records[0][''], 'num', 1);
            done();
          });
      });

    });

  });

});
