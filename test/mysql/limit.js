var assert = require('chai').assert;
var limit = require('../../src/mysql/query/limit');
var Database = require('../../src/mysql/Database');
var Table = require('../../src/mysql/Table');

describe('MySQL limit', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('throws error when $limit is Object', function () {
    assert.throws(function () { limit({}); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is Boolean', function () {
    assert.throws(function () { limit(true); }, /invalid \$limit argument/i);
    assert.throws(function () { limit(false); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is String', function () {
    assert.throws(function () { limit(''); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is Array', function () {
    assert.throws(function () { limit([]); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is null', function () {
    assert.throws(function () { limit(null); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is negative integer', function () {
    assert.throws(function () { limit(-1); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is float', function () {
    assert.throws(function () { limit(1.1234); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is zero', function () {
    assert.throws(function () { limit(0); }, /invalid \$limit argument/i);
  });

  it('accepts undefined $limit', function () {
    var result = limit();
    assert.strictEqual(result.sql, '');
    assert.lengthOf(result.params, 0);
  });

  it('accepts positive integer as $limit', function () {
    var result = limit(10);
    assert.strictEqual(result.sql, '10');
    assert.lengthOf(result.params, 0);
  });

});
