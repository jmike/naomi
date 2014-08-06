// load environmental variables
require('dotenv').load();

var chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  naomi = require('../../src/naomi'),
  assert, db;

// enable promises assertion
chai.use(chaiAsPromised);
assert = chai.assert;

// init database
db = naomi.create('MYSQL', {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_SCHEMA
});

describe('MySQL:Database', function () {

  describe('@disconnected state', function () {

    describe('#query()', function () {

      it('should throw an error when sql statement is invalid', function () {
        assert.isRejected(db.query(), /sql/i);
        assert.isRejected(db.query(1), /sql/i);
        assert.isRejected(db.query(true), /sql/i);
        assert.isRejected(db.query({}), /sql/i);
        assert.isRejected(db.query([]), /sql/i);
        assert.isRejected(db.query(null), /sql/i);
      });

      it('should throw an error when params array is invalid', function () {
        assert.isRejected(db.query('SELECT 1;', 1), /parameters/i);
        assert.isRejected(db.query('SELECT 1;', true), /parameters/i);
        assert.isRejected(db.query('SELECT 1;', 'foo'), /parameters/i);
        assert.isRejected(db.query('SELECT 1;', null), /parameters/i);
      });

      it('should throw an error when options is invalid', function () {
        assert.isRejected(db.query('SELECT 1;', [], 1), /options/i);
        assert.isRejected(db.query('SELECT 1;', [], true), /options/i);
        assert.isRejected(db.query('SELECT 1;', [], 'foo'), /options/i);
        assert.isRejected(db.query('SELECT 1;', [], []), /options/i);
        assert.isRejected(db.query('SELECT 1;', [], null), /options/i);
      });

      it('should return connection error on valid SQL statement', function () {
        assert.isRejected(db.query('SELECT 1;'), 'Connection is closed - did you forget to call #connect()?');
      });

    });

    describe('#extend()', function () {

      it('should throw an error when table name is invalid', function () {
        assert.throws(function () { db.extend(); });
        assert.throws(function () { db.extend(1); });
        assert.throws(function () { db.extend(true); });
        assert.throws(function () { db.extend({}); });
        assert.throws(function () { db.extend([]); });
        assert.throws(function () { db.extend(null); });
      });

    });

  });

  describe('@connected state', function () {

    before(function (done) {
      db.once('ready', done).connect();
    });

    after(function (done) {
      db.disconnect(done);
    });

    it('Tables "company" and "employee" should be related', function () {
      assert.isObject(db.tables.companyEmployee.related);
      assert.lengthOf(Object.keys(db.tables.companyEmployee.related), 2);

      assert.property(db.tables.companyEmployee.related, 'company');
      assert.isObject(db.tables.companyEmployee.related.company);
      assert.propertyVal(db.tables.companyEmployee.related.company, 'id', 'companyId');

      assert.property(db.tables.company.related, 'companyEmployee');
      assert.isObject(db.tables.company.related.companyEmployee);
      assert.propertyVal(db.tables.company.related.companyEmployee, 'companyId', 'id');

      assert.property(db.tables.companyEmployee.related, 'employee');
      assert.isObject(db.tables.companyEmployee.related.employee);
      assert.propertyVal(db.tables.companyEmployee.related.employee, 'id', 'employeeId');

      assert.property(db.tables.employee.related, 'companyEmployee');
      assert.isObject(db.tables.employee.related.companyEmployee);
      assert.propertyVal(db.tables.employee.related.companyEmployee, 'employeeId', 'id');
    });

    describe('#findPath()', function () {

      it('should return a valid path from "employee" to "company"', function () {
        var path = db.findPath('employee', 'company');
        assert.isArray(path);
        assert.strictEqual(path[0], 'employee');
        assert.strictEqual(path[1], 'companyEmployee');
        assert.strictEqual(path[2], 'company');
      });

      it('should return a valid path from "employee" to "country"', function () {
        var path = db.findPath('employee', 'country');
        assert.isArray(path);
        assert.strictEqual(path[0], 'employee');
        assert.strictEqual(path[1], 'country');
      });

      it('should return null from "employee" to "irrelevant"', function () {
        var path = db.findPath('employee', 'irrelevant');
        assert.isNull(path);
      });

    });

  });

});
