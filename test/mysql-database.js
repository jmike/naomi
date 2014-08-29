require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  assert = chai.assert,
  db;

// init database
db = naomi.create('mysql', {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT, 10),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_SCHEMA
});

describe('MySQL Database', function () {

  before(function (done) {
    db.once('ready', done);
    db.connect();
  });

  after(function (done) {
    db.disconnect(done);
  });

  it('has valid metadata', function () {
    var meta = db._meta;
    assert.isObject(meta);
    assert.property(meta, 'employees');
    assert.property(meta.employees, 'columns');
    assert.property(meta.employees.columns, 'id');
    assert.isString(meta.employees.columns.id.type);
    assert.isNumber(meta.employees.columns.id.position);
    assert.isBoolean(meta.employees.columns.id.isNullable);
    assert.property(meta.employees.columns, 'firstname');
    assert.property(meta.employees.columns, 'lastname');
    assert.property(meta.employees.columns, 'age');
    assert.isArray(meta.employees.primaryKey);
    assert.lengthOf(meta.employees.primaryKey, 1);
    assert.strictEqual(meta.employees.primaryKey[0], 'id');
    assert.isObject(meta.employees.uniqueKeys);
    assert.property(meta.employees.uniqueKeys, 'unique_idx');
    assert.isArray(meta.employees.uniqueKeys.unique_idx);
    assert.lengthOf(meta.employees.uniqueKeys.unique_idx, 2);
    assert.include(meta.employees.uniqueKeys.unique_idx, 'firstname');
    assert.include(meta.employees.uniqueKeys.unique_idx, 'lastname');
    assert.isObject(meta.employees.indexKeys);
    assert.property(meta.employees.indexKeys, 'age_idx');
    assert.isObject(meta.employees.refTables);
    assert.property(meta.employees.refTables, 'company_employees');
    assert.isArray(meta.employees.refTables.company_employees);
    assert.lengthOf(meta.employees.refTables.company_employees, 1);
    assert.strictEqual(meta.employees.refTables.company_employees[0].column, 'id');
    assert.strictEqual(meta.employees.refTables.company_employees[0].refColumn, 'employee_id');
  });

  describe('#getTableMeta()', function () {

    it('denotes relation between "companies" and "employees"', function () {
      var companies = db.getTableMeta('companies'),
        company_employees = db.getTableMeta('company_employees'),
        employees = db.getTableMeta('employees');

      assert.isObject(company_employees.refTables);
      assert.lengthOf(Object.keys(company_employees.refTables), 2);

      assert.property(company_employees.refTables, 'companies');
      assert.isArray(company_employees.refTables.companies);
      assert.isObject(company_employees.refTables.companies[0]);
      assert.propertyVal(company_employees.refTables.companies[0], 'column', 'company_id');
      assert.propertyVal(company_employees.refTables.companies[0], 'refColumn', 'id');

      assert.property(companies.refTables, 'company_employees');
      assert.isArray(companies.refTables.company_employees);
      assert.propertyVal(companies.refTables.company_employees[0], 'column', 'id');
      assert.propertyVal(companies.refTables.company_employees[0], 'refColumn', 'company_id');

      assert.property(company_employees.refTables, 'employees');
      assert.isArray(company_employees.refTables.employees);
      assert.propertyVal(company_employees.refTables.employees[0], 'column', 'employee_id');
      assert.propertyVal(company_employees.refTables.employees[0], 'refColumn', 'id');

      assert.property(employees.refTables, 'company_employees');
      assert.isArray(employees.refTables.company_employees);
      assert.propertyVal(employees.refTables.company_employees[0], 'column', 'id');
      assert.propertyVal(employees.refTables.company_employees[0], 'refColumn', 'employee_id');
    });

  });

  describe('#findPath()', function () {

    it('returns a valid path from "employees" to "companies"', function () {
      var path = db.findPath('employees', 'companies');
      assert.isArray(path);
      assert.strictEqual(path[0], 'employees');
      assert.strictEqual(path[1], 'company_employees');
      assert.strictEqual(path[2], 'companies');
    });

    it('returns a valid path from "employees" to "countries"', function () {
      var path = db.findPath('employees', 'countries');
      assert.isArray(path);
      assert.strictEqual(path[0], 'employees');
      assert.strictEqual(path[1], 'company_employees');
      assert.strictEqual(path[2], 'companies');
      assert.strictEqual(path[3], 'countries');
    });

    it('returns null from "employees" to "irrelevant"', function () {
      var path = db.findPath('employees', 'irrelevant');
      assert.isNull(path);
    });

  });

  describe('#isReady', function () {

    it('returns true', function () {
      assert.strictEqual(db.isReady, true);
    });

  });

  describe('#isConnected', function () {

    it('returns true', function () {
      assert.strictEqual(db.isConnected, true);
    });

  });

  describe('#hasTable()', function () {

    it('returns true on "employees"', function () {
      assert.strictEqual(db.hasTable('employees'), true);
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
