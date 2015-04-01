var assert = require('chai').assert;
var offset = require('../../src/mysql/query/offset');
var Database = require('../../src/mysql/Database');
var Table = require('../../src/mysql/Table');

describe('MySQL offset', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('throws error when $offset is Object', function () {
    assert.throws(function () { offset({}); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is Boolean', function () {
    assert.throws(function () { offset(true); }, /invalid \$offset argument/i);
    assert.throws(function () { offset(false); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is String', function () {
    assert.throws(function () { offset(''); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is Array', function () {
    assert.throws(function () { offset([]); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is null', function () {
    assert.throws(function () { offset(null); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is negative integer', function () {
    assert.throws(function () { offset(-1); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is float', function () {
    assert.throws(function () { offset(1.1234); }, /invalid \$offset argument/i);
  });

  it('accepts undefined $offset', function () {
    var result = offset();
    assert.strictEqual(result.sql, '');
    assert.lengthOf(result.params, 0);
  });

  it('accepts positive integer as $offset', function () {
    var result = offset(99);
    assert.strictEqual(result.sql, '99');
    assert.lengthOf(result.params, 0);
  });

  it('accepts zero (0) as $offset', function () {
    var result = offset(0);
    assert.strictEqual(result.sql, '0');
    assert.lengthOf(result.params, 0);
  });

});
