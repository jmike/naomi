// load environmental variables
require('dotenv').load();

var assert = require('chai').assert,
  naomi = require('../../src/naomi'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });


describe('MySQL:Database', function () {

  describe('#query()', function () {

    it('should throw an error when sql statement is invalid', function () {
      assert.throws(function () { db.query(); }, /sql/i);
      assert.throws(function () { db.query(1); }, /sql/i);
      assert.throws(function () { db.query(true); }, /sql/i);
      assert.throws(function () { db.query({}); }, /sql/i);
      assert.throws(function () { db.query([]); }, /sql/i);
      assert.throws(function () { db.query(null); }, /sql/i);
    });

    it('should throw an error when params array is invalid', function () {
      assert.throws(function () { db.query('SELECT 1;', 1); }, /invalid parameters/i);
      assert.throws(function () { db.query('SELECT 1;', true); }, /invalid parameters/i);
      assert.throws(function () { db.query('SELECT 1;', 'foo'); }, /invalid parameters/i);
      assert.throws(function () { db.query('SELECT 1;', null); }, /invalid parameters/i);
    });

    it('should throw an error when options is invalid', function () {
      assert.throws(function () { db.query('SELECT 1;', [], 1); }, /invalid query options/i);
      assert.throws(function () { db.query('SELECT 1;', [], true); }, /invalid query options/i);
      assert.throws(function () { db.query('SELECT 1;', [], 'foo'); }, /invalid query options/i);
      assert.throws(function () { db.query('SELECT 1;', [], []); }, /invalid query options/i);
      assert.throws(function () { db.query('SELECT 1;', [], null); }, /invalid query options/i);
    });

    it('should throw an error when callback is invalid', function () {
      assert.throws(function () { db.query('SELECT 1;', [], {}, 1); }, /invalid callback/i);
      assert.throws(function () { db.query('SELECT 1;', [], {}, true); }, /invalid callback/i);
      assert.throws(function () { db.query('SELECT 1;', [], {}, 'foo'); }, /invalid callback/i);
      assert.throws(function () { db.query('SELECT 1;', [], {}, []); }, /invalid callback/i);
      assert.throws(function () { db.query('SELECT 1;', [], {}, {}); }, /invalid callback/i);
      assert.throws(function () { db.query('SELECT 1;', [], {}, null); }, /invalid callback/i);
    });

    it('should return connection error on valid SQL statement', function (done) {
      db.query('SELECT 1;', function (err) {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Connection is closed - did you forget to call #connect()?');
        done();
      });
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
