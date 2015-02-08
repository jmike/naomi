var assert = require('chai').assert;
var Limit = require('../src/mysql/query/Limit');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Limit', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  describe('#fromQuery()', function () {

    it('throws error when $limit is Object', function () {
      assert.throws(function () { new Limit({}); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is Boolean', function () {
      assert.throws(function () { new Limit(true); }, /invalid \$limit argument/i);
      assert.throws(function () { new Limit(false); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is String', function () {
      assert.throws(function () { new Limit(''); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is Array', function () {
      assert.throws(function () { new Limit([]); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is null', function () {
      assert.throws(function () { new Limit(null); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is negative integer', function () {
      assert.throws(function () { new Limit(-1); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is float', function () {
      assert.throws(function () { new Limit(1.1234); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is zero', function () {
      assert.throws(function () { new Limit(0); }, /invalid \$limit argument/i);
    });

    it('accepts undefined $limit', function () {
      var limit = Limit.fromQuery({});
      assert.strictEqual(limit.value, null);
    });

    it('accepts positive integer as $limit', function () {
      var limit = new Limit(10);
      assert.strictEqual(limit.value, 10);
    });

  });

  describe('#toParamSQL()', function () {

    it('returns null when $limit is undefined', function () {
      var limit = new Limit();
      var stmt = limit.toParamSQL(table);
      assert.strictEqual(stmt, null);
    });

    it('successfully returns SQL given a valid $limit', function () {
      var limit = new Limit(99);
      var stmt = limit.toParamSQL(table);
      assert.strictEqual(stmt.sql, '99');
    });

  });

});
