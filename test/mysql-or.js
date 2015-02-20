var assert = require('chai').assert;
var expression = require('../src/mysql/query/expression');
var or = require('../src/mysql/query/expression.or')(expression);
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL or expression', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('throws error when $or is object', function () {
    assert.throws(function () { or({}); }, /invalid \$or expression/i);
  });

  it('throws error when $or is boolean', function () {
    assert.throws(function () { or(true); }, /invalid \$or expression/i);
    assert.throws(function () { or(false); }, /invalid \$or expression/i);
  });

  it('throws error when $or is string', function () {
    assert.throws(function () { or(''); }, /invalid \$or expression/i);
  });

  it('throws error when $or is null', function () {
    assert.throws(function () { or(null); }, /invalid \$or expression/i);
  });

  it('throws error when $or is number', function () {
    assert.throws(function () { or(123); }, /invalid \$or expression/i);
  });

  it('throws error when $or is empty array', function () {
    assert.throws(function () { or([]); }, /invalid \$or expression/i);
  });

  it('returns valid SQL when $or is a valid array', function () {
    var result = or([
      {id: 1},
      {name: 'joe'},
      {age: 25}
    ], table);
    assert.strictEqual(result.sql, '(`id` = ? OR `name` = ? OR `age` = ?)');
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 'joe');
    assert.strictEqual(result.params[2], 25);
  });

});
