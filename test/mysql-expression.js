var assert = require('chai').assert;
var expression = require('../src/mysql/query/expression');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL expression', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('throws error on array $expression', function () {
    assert.throws(function () { expression([], table); }, /invalid \$expression/i);
  });

  it('throws error on null $expression', function () {
    assert.throws(function () { expression(null, table); }, /invalid \$expression/i);
  });

  it('accepts undefined $expression', function () {
    assert.doesNotThrow(function () { expression(); });
  });

  it('accepts object $expression', function () {
    assert.doesNotThrow(function () { expression({name: 'Jim'}, table); });
  });

  it('accepts empty object $expression', function () {
    assert.doesNotThrow(function () { expression({}, table); });
  });

  it('accepts number $expression', function () {
    assert.doesNotThrow(function () { expression(123, table); });
  });

  it('accepts string $expression', function () {
    assert.doesNotThrow(function () { expression('string', table); });
  });

  it('accepts boolean $expression', function () {
    assert.doesNotThrow(function () { expression(true, table); });
  });

  it('accepts date $expression', function () {
    assert.doesNotThrow(function () { expression(new Date(), table); });
  });

  it('accepts buffer $expression', function () {
    var buf = new Buffer('abcde');
    assert.doesNotThrow(function () { expression(buf, table); });
  });

  it('returns valid SQL when $expression is number', function () {
    var query = expression(1, table);
    assert.strictEqual(query.sql, '`id` = ?');
    assert.strictEqual(query.params[0], 1);
  });

  it('returns valid SQL when $expression is string', function () {
    var query = expression('string', table);
    assert.strictEqual(query.sql, '`id` = ?');
    assert.strictEqual(query.params[0], 'string');
  });

  it('returns valid SQL when $expression is date', function () {
    var d = new Date();
    var query = expression(d, table);
    assert.strictEqual(query.sql, '`id` = ?');
    assert.strictEqual(query.params[0], d);
  });

  it('returns valid SQL when $expression is boolean', function () {
    var query = expression(true, table);
    assert.strictEqual(query.sql, '`id` = ?');
    assert.strictEqual(query.params[0], true);
  });

  it('returns valid SQL when $expression is buffer', function () {
    var buf =  new Buffer('abcdef');
    var query = expression(buf, table);
    assert.strictEqual(query.sql, '`id` = ?');
    assert.strictEqual(query.params[0], buf);
  });

  it('returns valid SQL when $expression contains $id', function () {
    var query = expression({$id: {$lte: 20}}, table);
    assert.strictEqual(query.sql, '`id` <= ?');
    assert.strictEqual(query.params[0], 20);
  });

});
