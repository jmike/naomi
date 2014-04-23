var assert = require('chai').assert,
  async = require('async'),
  naomi = require('../../src/naomi'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('Employees collection', function () {

  var employees = db.extend('employees');

  before(function (done) {
    db.connect(function (error) {
      var sql = 'CREATE TABLE IF NOT EXISTS `employees` (`id` int(10) unsigned NOT NULL AUTO_INCREMENT, `firstName` varchar(45) NOT NULL, `lastName` varchar(45) NOT NULL, `age` tinyint(3) unsigned DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;';

      if (error) return done(error);

      db.query(sql, done);
    });
  });

  after(function (done) {
    db.disconnect(done);
  });

  it('should be able run a CRUD + Count operation successfully', function (done) {

    async.series({

      create: function (callback) {
        employees.set({
          id: 1,
          firstName: 'James',
          lastName: 'Bond',
          age: 36
        }, function (error, meta) {
          callback(error, {meta: meta});
        });
      },

      read: function (callback) {
        employees.get(1, function (error, records, meta) {
          callback(error, {records: records, meta: meta});
        });
      },

      count: function (callback) {
        employees.count(function (error, count) {
          callback(error, {count: count});
        });
      },

      update: function (callback) {
        employees.set({
          id: 1,
          firstName: 'James',
          lastName: 'Bond',
          age: 36
        }, function (error, meta) {
          callback(error, {meta: meta});
        });
      },

      delete: function (callback) {
        employees.del(1, function (error, meta) {
          callback(error, {meta: meta});
        });
      }

    }, function (error, result) {
      if (error) return done(error);

      assert.isObject(result.create.meta);
      assert.strictEqual(result.create.meta.insertId, 1);

      assert.isArray(result.read.records);
      assert.lengthOf(result.read.records, 1);
      assert.isObject(result.read.meta);
      assert.isArray(result.read.meta.fields);

      assert.isNumber(result.count.count);
      assert.strictEqual(result.count.count, 1);

      assert.isObject(result.update.meta);

      assert.isObject(result.delete.meta);

      done();
    });
  });

});
