var assert = require('chai').assert;
var Count = require('../src/mysql/query/Count');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Count', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  describe('constructor', function () {

    it('accepts undefined $query', function () {
      var count = new Count();
      assert.strictEqual(count._filter._v, null);
      assert.lengthOf(count._orderby._arr, 0);
      assert.strictEqual(count._limit._v, null);
      assert.strictEqual(count._offset._v, null);
    });

  });

  describe('#toParamSQL()', function () {

    it('returns SQL + params when $query is undefined', function () {
      var count = new Count();
      var query = count.toParamSQL(table);
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees`;');
    });

    it('returns SQL + params when $query is number', function () {
      var count = new Count(1);
      var query = count.toParamSQL(table);
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `id` = ?;');
      assert.lengthOf(query.params, 1);
      assert.strictEqual(query.params[0], 1);
    });

    it('returns SQL + params when $query is object', function () {
      var count = new Count({
        $orderby: [{id: 1}],
        $limit: 99,
        $offset: 1,
        age: {$gte: 18}
      });
      var query = count.toParamSQL(table);
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `age` >= ? ORDER BY `id` ASC LIMIT 99 OFFSET 1;');
      assert.lengthOf(query.params, 1);
      assert.strictEqual(query.params[0], 18);
    });

  });

});
