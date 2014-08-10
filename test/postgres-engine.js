require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  PostgresEngine = require('../src/PostgresEngine'),
  assert = chai.assert,
  engine;

engine = new PostgresEngine({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_SCHEMA
});

describe('Postgres database engine', function () {

  before(function (done) {
    engine.connect().then(done);
  });

  after(function (done) {
    engine.disconnect().then(done);
  });

  describe('#query()', function () {

    it('retrieves records from database on valid input', function (done) {
      engine.query('SELECT 1;', []).then(function (records) {
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
        assert.isArray(meta.employees.primaryKey);
        assert.isObject(meta.employees.uniqueKeys);
        assert.isObject(meta.employees.indexKeys);
        assert.isObject(meta.employees.refTables);
        done();
      });
    });

  });

});
