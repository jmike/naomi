var assert = require('chai').assert;
var values = require('../../src/mysql/query/values');
var Database = require('../../src/mysql/Database');
var Table = require('../../src/mysql/Table');

describe('MySQL values', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];


  it('throws error when $values is Boolean', function () {
    assert.throws(function () { values(true, table); }, /invalid \$values argument/i);
    assert.throws(function () { values(false, table); }, /invalid \$values argument/i);
  });

  it('throws error when $values is String', function () {
    assert.throws(function () { values('', table); }, /invalid \$values argument/i);
  });

  it('throws error when $values is null', function () {
    assert.throws(function () { values(null, table); }, /invalid \$values argument/i);
  });

  it('throws error when $values is number', function () {
    assert.throws(function () { values(123, table); }, /invalid \$values argument/i);
  });

  it('throws error when $values array contains number', function () {
    assert.throws(function () { values([123], table); }, /invalid \$values element/i);
  });

  it('throws error when $values array contains boolean', function () {
    assert.throws(function () { values([true], table); }, /invalid \$values element/i);
    assert.throws(function () { values([false], table); }, /invalid \$values element/i);
  });

  it('accepts undefined $values', function () {
    var result = values(undefined, table);
    assert.strictEqual(result.sql, '()');
    assert.lengthOf(result.params, 0);
  });

  it('accepts object as $values', function () {
    var result = values({id: 1, name: 'John', age: 20}, table);
    assert.strictEqual(result.sql, '(?, ?, ?)');
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 'John');
    assert.strictEqual(result.params[2], 20);
  });

  it('accepts array as $values', function () {
    var result = values([
      {id: 1, name: 'John', age: 20},
      {id: 2, name: 'Maria', age: 30}
    ], table);
    assert.strictEqual(result.sql, '(?, ?, ?), (?, ?, ?)');
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 'John');
    assert.strictEqual(result.params[2], 20);
    assert.strictEqual(result.params[3], 2);
    assert.strictEqual(result.params[4], 'Maria');
    assert.strictEqual(result.params[5], 30);
  });

});
