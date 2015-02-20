require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var projection = require('../src/mysql/query/projection');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL projection', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('throws error when $projection is number', function () {
    assert.throws(function () { projection(-1); }, /invalid \$projection argument/i);
    assert.throws(function () { projection(0); }, /invalid \$projection argument/i);
    assert.throws(function () { projection(1); }, /invalid \$projection argument/i);
  });

  it('throws error when $projection is boolean', function () {
    assert.throws(function () { projection(true); }, /invalid \$projection argument/i);
    assert.throws(function () { projection(false); }, /invalid \$projection argument/i);
  });

  it('throws error when $projection is string', function () {
    assert.throws(function () { projection(''); }, /invalid \$projection argument/i);
  });

  it('throws error when $projection is array', function () {
    assert.throws(function () { projection([]); }, /invalid \$projection argument/i);
  });

  it('throws error when $projection is null', function () {
    assert.throws(function () { projection(null); }, /invalid \$projection argument/i);
  });

  it('returns all table columns when $projection is undefined', function () {
    var result = projection(undefined, table);
    assert.strictEqual(result.sql, '`id`, `name`, `age`, `country`');
    assert.lengthOf(result.params, 0);
  });

  it('returns $include columns when $include is specified', function () {
    var result = projection({name: 1, age: 1}, table);
    assert.strictEqual(result.sql, '`name`, `age`');
    assert.lengthOf(result.params, 0);
  });

  it('returns all columns excluding the $exclude columns when $exclude is specified', function () {
    var result = projection({id: -1}, table);
    assert.strictEqual(result.sql, '`name`, `age`, `country`');
    assert.lengthOf(result.params, 0);
  });

  it('ignores the $exclude columns in favor of $include', function () {
    var result = projection({name: 1, age: 1, id: -1}, table);
    assert.strictEqual(result.sql, '`name`, `age`');
    assert.lengthOf(result.params, 0);
  });

  it('throws error when $include contains unknown columns', function () {
    assert.throws(function () { projection({unknown: 1}, table); }, /unknown column/i);
  });

  it('throws error when $exlude contains unknown columns', function () {
    assert.throws(function () { projection({unknown: -1}, table); }, /unknown column/i);
  });

});
