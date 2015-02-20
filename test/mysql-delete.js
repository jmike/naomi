var assert = require('chai').assert;
var del = require('../src/mysql/query/delete');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL delete', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('accepts undefined $query', function () {
    var result = del(undefined, table);
    assert.strictEqual(result.sql, 'DELETE FROM `employees`;');
    assert.lengthOf(result.params, 0);
  });

  it('returns SQL + params when $query is number', function () {
    var result = del(1, table);
    assert.strictEqual(result.sql, 'DELETE FROM `employees` WHERE `id` = ?;');
    assert.lengthOf(result.params, 1);
    assert.strictEqual(result.params[0], 1);
  });

  it('returns SQL + params when $query is object', function () {
    var result = del({
      $orderby: [{id: 1}],
      $limit: 99,
      $offset: 1,
      age: {$gte: 18}
    }, table);
    assert.strictEqual(result.sql, 'DELETE FROM `employees` WHERE `age` >= ? ORDER BY `id` ASC LIMIT 99;');
    assert.lengthOf(result.params, 1);
    assert.strictEqual(result.params[0], 18);
  });

});
