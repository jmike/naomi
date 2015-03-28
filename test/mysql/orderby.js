var assert = require('chai').assert;
var orderby = require('../../src/mysql/query/orderby');
var Database = require('../../src/mysql/Database');
var Table = require('../../src/mysql/Table');

describe('MySQL orderby', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('throws error when $orderby is object', function () {
    assert.throws(function () { orderby({}); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby is boolean', function () {
    assert.throws(function () { orderby(true); }, /invalid \$orderby argument/i);
    assert.throws(function () { orderby(false); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby is string', function () {
    assert.throws(function () { orderby(''); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby is null', function () {
    assert.throws(function () { orderby(null); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby is number', function () {
    assert.throws(function () { orderby(123); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby contains number', function () {
    assert.throws(function () { orderby([123]); }, /invalid \$orderby element/i);
  });

  it('throws error when $orderby contains boolean', function () {
    assert.throws(function () { orderby([true]); }, /invalid \$orderby element/i);
    assert.throws(function () { orderby([false]); }, /invalid \$orderby element/i);
  });

  it('throws error when $orderby contains empty object', function () {
    assert.throws(function () { orderby([{}]); }, /invalid \$orderby element/i);
  });

  it('throws error when $orderby contains object with > 1 elements', function () {
    assert.throws(function () { orderby([{a: 1, b: 1}]); }, /invalid \$orderby element/i);
  });

  it('throws error when $orderby contains object with invalid value', function () {
    assert.throws(function () { orderby([{a: 0}]); }, /invalid \$orderby element/i);
    assert.throws(function () { orderby([{a: 2}]); }, /invalid \$orderby element/i);
    assert.throws(function () { orderby([{a: -2}]); }, /invalid \$orderby element/i);
  });

  it('accepts undefined $orderby', function () {
    var result = orderby(undefined, table);
    assert.strictEqual(result.sql, '');
    assert.lengthOf(result.params, 0);
  });

  it('accepts empty $orderby', function () {
    var result = orderby([], table);
    assert.strictEqual(result.sql, '');
    assert.lengthOf(result.params, 0);
  });

  it('accepts string $orderby element', function () {
    var result = orderby(['id'], table);
    assert.strictEqual(result.sql, '`id` ASC');
    assert.lengthOf(result.params, 0);
  });

  it('accepts object $orderby element', function () {
    var result = orderby([{id: 1}], table);
    assert.strictEqual(result.sql, '`id` ASC');
    assert.lengthOf(result.params, 0);
  });

  it('accepts mixture of string and object $orderby elements', function () {
    var result = orderby(['id', {name: -1}], table);
    assert.strictEqual(result.sql, '`id` ASC, `name` DESC');
    assert.lengthOf(result.params, 0);
  });

});
