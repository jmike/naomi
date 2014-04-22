var assert = require('chai').assert,
  naomi = require('../../src/naomi'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('employees collection', function () {

  var employees = db.extend('employees');

  before(function (done) {
    db.connect(function (error) {
      var sql = 'CREATE TABLE IF NOT EXISTS `employees` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT, `firstName` varchar(45) NOT NULL, `lastName` varchar(45) NOT NULL, `age` tinyint(3) unsigned DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;';

      if (error) {
        done(error);
      } else {
        db.query(sql, done);
      }
    });
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
    employees.count(function (error, count) {
      if (error) return done(error);

      assert.isNumber(count);
      done();
    });
  });

});
