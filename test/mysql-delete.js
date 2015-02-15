var assert = require('chai').assert;
var Delete = require('../src/mysql/query/Delete');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Delete', function () {

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
      var del = new Delete();
      assert.strictEqual(del._filter._v, null);
      assert.lengthOf(del._orderby._arr, 0);
      assert.strictEqual(del._limit._v, null);
    });

  });

  describe('#toParamSQL()', function () {

    it('returns SQL + params when $query is undefined', function () {
      var del = new Delete();
      var query = del.toParamSQL(table);
      assert.strictEqual(query.sql, 'DELETE FROM `employees`;');
    });

    it('returns SQL + params when $query is number', function () {
      var del = new Delete(1);
      var query = del.toParamSQL(table);
      assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `id` = ?;');
      assert.lengthOf(query.params, 1);
      assert.strictEqual(query.params[0], 1);
    });

    it('returns SQL + params when $query is object', function () {
      var del = new Delete({
        $orderby: [{id: 1}],
        $limit: 99,
        $offset: 1,
        age: {$gte: 18}
      });
      var query = del.toParamSQL(table);
      assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `age` >= ? ORDER BY `id` ASC LIMIT 99;');
      assert.lengthOf(query.params, 1);
      assert.strictEqual(query.params[0], 18);
    });

  });

});
