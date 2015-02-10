var assert = require('chai').assert;
var Offset = require('../src/mysql/query/Offset');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Offset', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  describe('contructor', function () {

    it('throws error when $offset is Object', function () {
      assert.throws(function () { new Offset({}); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is Boolean', function () {
      assert.throws(function () { new Offset(true); }, /invalid \$offset argument/i);
      assert.throws(function () { new Offset(false); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is String', function () {
      assert.throws(function () { new Offset(''); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is Array', function () {
      assert.throws(function () { new Offset([]); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is null', function () {
      assert.throws(function () { new Offset(null); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is negative integer', function () {
      assert.throws(function () { new Offset(-1); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is float', function () {
      assert.throws(function () { new Offset(1.1234); }, /invalid \$offset argument/i);
    });

    it('accepts undefined $offset', function () {
      var offset = Offset.fromObject({});
      assert.strictEqual(offset._v, null);
    });

    it('accepts positive integer as $offset', function () {
      var offset = new Offset(10);
      assert.strictEqual(offset._v, 10);
    });

    it('accepts zero (0) as $offset', function () {
      var offset = new Offset(0);
      assert.strictEqual(offset._v, 0);
    });

  });

  describe('#toParamSQL()', function () {

    it('returns null when $offset is undefined', function () {
      var offset = new Offset();
      var query = offset.toParamSQL(table);
      assert.strictEqual(query, null);
    });

    it('successfully returns SQL given a valid $offset', function () {
      var offset = new Offset(9);
      var query = offset.toParamSQL(table);
      assert.strictEqual(query.sql, '9');
    });

  });

});
