var assert = require('chai').assert,
  rdb = require('../../src/rdb'),
  db = rdb.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('employees model', function () {

  var employees = db.extend('employees');

  before(function (done) {
    db.connect(done);
  });

  after(function (done) {
    db.disconnect(done);
  });

  it('should be able to set a record', function (done) {
    employees.set({
      id: 1,
      firstName: 'James',
      lastName: 'Bond',
      age: 36
    }, done);
  });

  it('should be able to get all records', function (done) {
    employees.get(function (error, records) {
      if (error) return done(error);

      assert.isArray(records);
      done();
    });
  });

  it('should be able to count all records', function (done) {
    employees.count(function (error, records) {
      if (error) return done(error);

      assert.isArray(records);
      assert.lengthOf(records, 1);
      assert.isNumber(records[0].count);
      done();
    });
  });

});
