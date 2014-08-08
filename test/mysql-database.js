require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  assert = chai.assert,
  db;

// init database
db = naomi.create('mysql', {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_SCHEMA
});

describe('MySQL Database', function () {

  describe('@disconnected', function () {

    describe('#query()', function () {

      it('throws an error when sql statement is unspecified', function (done) {
        db.query().catch(function (err) {
          assert.match(err, /sql/i);
          done();
        });
      });

      it('throws an error when sql statement is Number', function (done) {
        db.query(1).catch(function (err) {
          assert.match(err, /sql/i);
          done();
        });
      });

      it('throws an error when sql statement is Boolean', function (done) {
        db.query(true).catch(function (err) {
          assert.match(err, /sql/i);
          done();
        });
      });

      it('throws an error when sql statement is Object', function (done) {
        db.query({}).catch(function (err) {
          assert.match(err, /sql/i);
          done();
        });
      });

      it('throws an error when sql statement is Array', function (done) {
        db.query([]).catch(function (err) {
          assert.match(err, /sql/i);
          done();
        });
      });

      it('throws an error when sql statement is null', function (done) {
        db.query(null).catch(function (err) {
          assert.match(err, /sql/i);
          done();
        });
      });

      it('throws an error when params array is Number', function (done) {
        db.query('SELECT 1;', 1).catch(function (err) {
          assert.match(err, /parameters/i);
          done();
        });
      });

      it('throws an error when params array is Boolean', function (done) {
        db.query('SELECT 1;', true).catch(function (err) {
          assert.match(err, /parameters/i);
          done();
        });
      });

      it('throws an error when params array is String', function (done) {
        db.query('SELECT 1;', 'foo').catch(function (err) {
          assert.match(err, /parameters/i);
          done();
        });
      });

      it('throws an error when params array is null', function (done) {
        db.query('SELECT 1;', null).catch(function (err) {
          assert.match(err, /parameters/i);
          done();
        });
      });

      it('throws an error when params array is null', function (done) {
        db.query('SELECT 1;', null).catch(function (err) {
          assert.match(err, /parameters/i);
          done();
        });
      });

      it('throws an error when options is Number', function (done) {
        db.query('SELECT 1;', [], 1).catch(function (err) {
          assert.match(err, /options/i);
          done();
        });
      });

      it('throws an error when options is Boolean', function (done) {
        db.query('SELECT 1;', [], true).catch(function (err) {
          assert.match(err, /options/i);
          done();
        });
      });

      it('throws an error when options is String', function (done) {
        db.query('SELECT 1;', [], 'foo').catch(function (err) {
          assert.match(err, /options/i);
          done();
        });
      });

      it('throws an error when options is Array', function (done) {
        db.query('SELECT 1;', [], []).catch(function (err) {
          assert.match(err, /options/i);
          done();
        });
      });

      it('throws an error when options is null', function (done) {
        db.query('SELECT 1;', [], null).catch(function (err) {
          assert.match(err, /options/i);
          done();
        });
      });

      it('throws a connection error on valid SQL statement', function (done) {
        db.query('SELECT 1;').catch(function (err) {
          assert.strictEqual(err, 'Connection is closed - did you forget to call #connect()?');
          done();
        });
      });

    });

    describe('#extend()', function () {

      it('throws an error when table name is unspecified', function () {
        assert.throws(function () { db.extend(); });
      });

      it('throws an error when table name is Number', function () {
        assert.throws(function () { db.extend(1); });
      });

      it('throws an error when table name is Boolean', function () {
        assert.throws(function () { db.extend(true); });
      });

      it('throws an error when table name is Object', function () {
        assert.throws(function () { db.extend({}); });
      });

      it('throws an error when table name is Array', function () {
        assert.throws(function () { db.extend([]); });
      });

      it('throws an error when table name is null', function () {
        assert.throws(function () { db.extend(null); });
      });

    });

  });

  // describe('@connected', function () {

  //   before(function (done) {
  //     db.once('ready', done);
  //     db.connect();
  //   });

  //   after(function (done) {
  //     db.disconnect(done);
  //   });

  //   it('Tables "company" and "employee" should be related', function () {
  //     var company = db.getTableMeta('company'),
  //       companyEmployee = db.getTableMeta('companyEmployee'),
  //       employee = db.getTableMeta('employee');

  //     assert.isObject(companyEmployee.related);
  //     assert.lengthOf(Object.keys(companyEmployee.related), 2);

  //     assert.property(companyEmployee.related, 'company');
  //     assert.isObject(companyEmployee.related.company);
  //     assert.propertyVal(companyEmployee.related.company, 'id', 'companyId');

  //     assert.property(company.related, 'companyEmployee');
  //     assert.isObject(company.related.companyEmployee);
  //     assert.propertyVal(company.related.companyEmployee, 'companyId', 'id');

  //     assert.property(companyEmployee.related, 'employee');
  //     assert.isObject(companyEmployee.related.employee);
  //     assert.propertyVal(companyEmployee.related.employee, 'id', 'employeeId');

  //     assert.property(employee.related, 'companyEmployee');
  //     assert.isObject(employee.related.companyEmployee);
  //     assert.propertyVal(employee.related.companyEmployee, 'employeeId', 'id');
  //   });

  //   describe('#findPath()', function () {

  //     it('should return a valid path from "employee" to "company"', function () {
  //       var path = db.findPath('employee', 'company');
  //       assert.isArray(path);
  //       assert.strictEqual(path[0], 'employee');
  //       assert.strictEqual(path[1], 'companyEmployee');
  //       assert.strictEqual(path[2], 'company');
  //     });

  //     it('should return a valid path from "employee" to "country"', function () {
  //       var path = db.findPath('employee', 'country');
  //       assert.isArray(path);
  //       assert.strictEqual(path[0], 'employee');
  //       assert.strictEqual(path[1], 'country');
  //     });

  //     it('should return null from "employee" to "irrelevant"', function () {
  //       var path = db.findPath('employee', 'irrelevant');
  //       assert.isNull(path);
  //     });

  //   });

  // });

});
