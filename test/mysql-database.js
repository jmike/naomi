require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  assert = chai.assert,
  db;

// init database
db = naomi.create('mysql', {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT, 10),
  user: process.env.MYSQL_USERNAME,
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

  it('has metadata that denote relation between "companies" and "employees" table', function () {
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

  // describe('@connected', function () {

  //   describe('#findPath()', function () {

  //     it('should return a valid path from "employees" to "companies"', function () {
  //       var path = db.findPath('employees', 'companies');
  //       assert.isArray(path);
  //       assert.strictEqual(path[0], 'employees');
  //       assert.strictEqual(path[1], 'company_employees');
  //       assert.strictEqual(path[2], 'companies');
  //     });

  //     it('should return a valid path from "employees" to "country"', function () {
  //       var path = db.findPath('employees', 'country');
  //       assert.isArray(path);
  //       assert.strictEqual(path[0], 'employees');
  //       assert.strictEqual(path[1], 'country');
  //     });

  //     it('should return null from "employees" to "irrelevant"', function () {
  //       var path = db.findPath('employees', 'irrelevant');
  //       assert.isNull(path);
  //     });

  //   });

  // });

});
