require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var naomi = require('../../src/naomi');

describe('MySQL Database', function () {

  var db = naomi.create('mysql', {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  describe('@disconnected', function () {

    describe('#hasTable()', function () {

      it('throws error when table is unspecified', function (done) {
        db.hasTable()
          .catch(function (err) {
            assert.match(err, /invalid table argument/i);
            done();
          });
      });

      it('throws error when table is Number', function (done) {
        db.hasTable(123)
          .catch(function (err) {
            assert.match(err, /invalid table argument/i);
            done();
          });
      });

      it('throws error when table is Boolean', function (done) {
        db.hasTable(true)
          .catch(function (err) {
            assert.match(err, /invalid table argument/i);
            done();
          });
      });

      it('throws error when table is Object', function (done) {
        db.hasTable({})
          .catch(function (err) {
            assert.match(err, /invalid table argument/i);
            done();
          });
      });

      it('throws error when table is Array', function (done) {
        db.hasTable([])
          .catch(function (err) {
            assert.match(err, /invalid table argument/i);
            done();
          });
      });

      it('throws error when table is null', function (done) {
        db.hasTable(null)
          .catch(function (err) {
            assert.match(err, /invalid table argument/i);
            done();
          });
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

    describe('#query()', function () {

      it('rejects with error when sql statement is unspecified', function (done) {
        db.query()
          .catch(function (err) {
            assert.match(err, /invalid sql argument/i);
            done();
          });
      });

      it('rejects with error when sql statement is number', function (done) {
        db.query(123)
          .catch(function (err) {
            assert.match(err, /invalid sql argument/i);
            done();
          });
      });

      it('rejects with error when sql statement is Boolean', function (done) {
        db.query(true)
          .catch(function (err) {
            assert.match(err, /invalid sql argument/i);
            done();
          });
      });

      it('rejects with error when sql statement is Object', function (done) {
        db.query({})
          .catch(function (err) {
            assert.match(err, /invalid sql argument/i);
            done();
          });
      });

      it('rejects with error when sql statement is Array', function (done) {
        db.query([])
          .catch(function (err) {
            assert.match(err, /invalid sql argument/i);
            done();
          });
      });

      it('rejects with error when sql statement is null', function (done) {
        db.query(null)
          .catch(function (err) {
            assert.match(err, /invalid sql argument/i);
            done();
          });
      });

      it('rejects with error when params is Number', function (done) {
        db.query('sql', 123)
          .catch(function (err) {
            assert.match(err, /invalid params argument/i);
            done();
          });
      });

      it('rejects with error when params is Boolean', function (done) {
        db.query('sql', true)
          .catch(function (err) {
            assert.match(err, /invalid params argument/i);
            done();
          });
      });

      it('rejects with error when params is String', function (done) {
        db.query('sql', '')
          .catch(function (err) {
            assert.match(err, /invalid params argument/i);
            done();
          });
      });

      it('rejects with error when params is null', function (done) {
        db.query('sql', null)
          .catch(function (err) {
            assert.match(err, /invalid params argument/i);
            done();
          });
      });

      it('rejects with error when options is Number', function (done) {
        db.query('sql', [], 123)
          .catch(function (err) {
            assert.match(err, /invalid options argument/i);
            done();
          });
      });

      it('rejects with error when options is Boolean', function (done) {
        db.query('sql', [], true)
          .catch(function (err) {
            assert.match(err, /invalid options argument/i);
            done();
          });
      });

      it('rejects with error when options is String', function (done) {
        db.query('sql', [], '')
          .catch(function (err) {
            assert.match(err, /invalid options argument/i);
            done();
          });
      });

      it('rejects with error when options is Array', function (done) {
        db.query('sql', [], [])
          .catch(function (err) {
            assert.match(err, /invalid options argument/i);
            done();
          });
      });

      it('rejects with error when options is null', function (done) {
        db.query('sql', [], null)
          .catch(function (err) {
            assert.match(err, /invalid options argument/i);
            done();
          });
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
