require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  MySQLEngine = require('../src/MySQLEngine'),
  assert = chai.assert,
  engine;

engine = new MySQLEngine({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT, 10),
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_SCHEMA
});

describe('MySQL database engine', function () {

  before(function (done) {
    engine.connect().then(done);
  });

  after(function (done) {
    engine.disconnect().then(done);
  });

  describe('#query()', function () {

    it('retrieves records from database on valid input', function (done) {
      engine.query('SELECT 1;', [], {}).then(function (records) {
        assert.isArray(records);
        assert.lengthOf(records, 1);
        done();
      });
    });

  });

  describe('#getMetaData()', function () {

    it('returns a valid metadata object', function (done) {
      engine.getMetaData().then(function (meta) {
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
        assert.property(meta.employees.columns, 'country_id');
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
        assert.property(meta.employees.indexKeys, 'country_idx');
        assert.isObject(meta.employees.refTables);
        assert.property(meta.employees.refTables, 'company_employees');
        assert.isArray(meta.employees.refTables.company_employees);
        assert.lengthOf(meta.employees.refTables.company_employees, 1);
        assert.strictEqual(meta.employees.refTables.company_employees[0].column, 'id');
        assert.strictEqual(meta.employees.refTables.company_employees[0].refColumn, 'employee_id');
        done();
      });
    });

  });

});
