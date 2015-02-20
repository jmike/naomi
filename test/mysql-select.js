var assert = require('chai').assert;
var select = require('../src/mysql/query/select');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL select', function () {

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
    var result = select(undefined, table);
    assert.strictEqual(result.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees`;');
  });

  it('returns SQL + params when $query is number', function () {
    var result = select(1, table);
    assert.strictEqual(result.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees` WHERE `id` = ?;');
    assert.lengthOf(result.params, 1);
    assert.strictEqual(result.params[0], 1);
  });

  it('returns SQL + params when $result is object', function () {
    var result = select({
      $projection: {age: -1},
      $orderby: [{id: 1}],
      $limit: 99,
      $offset: 1,
      age: {$gte: 18}
    }, table);
    assert.strictEqual(result.sql, 'SELECT `id`, `name`, `country` FROM `employees` WHERE `age` >= ? ORDER BY `id` ASC LIMIT 99 OFFSET 1;');
    assert.lengthOf(result.params, 1);
    assert.strictEqual(result.params[0], 18);
  });

});
