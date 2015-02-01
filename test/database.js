require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var Database = require('../src/Database');

describe('Database', function () {

  var db = new Database({database: 'something'});

  describe('#extend', function () {

    it('throws error when tableName is Number', function () {
      assert.throws(function () { db.extend(123); }, /invalid tableName argument/i);
    });

    it('throws error when tableName is Boolean', function () {
      assert.throws(function () { db.extend(true); }, /invalid tableName argument/i);
      assert.throws(function () { db.extend(false); }, /invalid tableName argument/i);
    });

    it('throws error when tableName is null', function () {
      assert.throws(function () { db.extend(null); }, /invalid tableName argument/i);
    });

    it('throws error when tableName is Object', function () {
      assert.throws(function () { db.extend({}); }, /invalid tableName argument/i);
    });

    it('throws error when tableName is Array', function () {
      assert.throws(function () { db.extend([]); }, /invalid tableName argument/i);
    });

    it('throws error when tableName is Date', function () {
      assert.throws(function () { db.extend(new Date()); }, /invalid tableName argument/i);
    });

  });

  describe('@disconnected', function () {

    describe('#isConnected', function () {

      it('returns false', function () {
        assert.strictEqual(db.isConnected, false);
      });

    });

  });

});
