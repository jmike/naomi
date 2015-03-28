var assert = require('chai').assert;
var expression = require('../../src/mysql/query/expression');
var and = require('../../src/mysql/query/expression.and')(expression);
var Database = require('../../src/mysql/Database');
var Table = require('../../src/mysql/Table');

describe('MySQL and expression', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('throws error when $and is object', function () {
    assert.throws(function () { and({}); }, /invalid \$and expression/i);
  });

  it('throws error when $and is boolean', function () {
    assert.throws(function () { and(true); }, /invalid \$and expression/i);
    assert.throws(function () { and(false); }, /invalid \$and expression/i);
  });

  it('throws error when $and is string', function () {
    assert.throws(function () { and(''); }, /invalid \$and expression/i);
  });

  it('throws error when $and is null', function () {
    assert.throws(function () { and(null); }, /invalid \$and expression/i);
  });

  it('throws error when $and is number', function () {
    assert.throws(function () { and(123); }, /invalid \$and expression/i);
  });

  it('throws error when $and is empty array', function () {
    assert.throws(function () { and([]); }, /invalid \$and expression/i);
  });

  it('returns valid SQL when $and is a valid array', function () {
    var result = and([
      {id: 1},
      {name: 'joe'},
      {age: 25}
    ], table);
    assert.strictEqual(result.sql, '(`id` = ? AND `name` = ? AND `age` = ?)');
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 'joe');
    assert.strictEqual(result.params[2], 25);
  });

  it('returns valid SQL when $and is a array with nested expressions', function () {
    var result = and([
      1,
      {age: {$lte: 25}},
      {$or: [3, {name: 'john'}]}
    ], table);
    assert.strictEqual(result.sql, '(`id` = ? AND `age` <= ? AND (`id` = ? OR `name` = ?))');
    assert.lengthOf(result.params, 4);
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 25);
    assert.strictEqual(result.params[2], 3);
    assert.strictEqual(result.params[3], 'john');
  });

});
