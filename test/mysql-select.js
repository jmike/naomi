var assert = require('chai').assert;
var Select = require('../src/mysql/query/Select');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Select', function () {

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
      var selector = new Select();
      assert.lengthOf(selector._projection._exclude, 0);
      assert.lengthOf(selector._projection._include, 0);
      assert.strictEqual(selector._filter._v, null);
      assert.lengthOf(selector._orderby._arr, 0);
      assert.strictEqual(selector._limit._v, null);
      assert.strictEqual(selector._offset._v, null);
    });

  });

  describe('#toParamSQL()', function () {

    it('returns SQL + params when $query is undefined', function () {
      var select = new Select();
      var query = select.toParamSQL(table);
      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees`;');
    });

    it('returns SQL + params when $query is number', function () {
      var select = new Select(1);
      var query = select.toParamSQL(table);
      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees` WHERE `id` = ?;');
      assert.lengthOf(query.params, 1);
      assert.strictEqual(query.params[0], 1);
    });

    it('returns SQL + params when $query is object', function () {
      var select = new Select({
        $projection: {age: -1},
        $orderby: [{id: 1}],
        $limit: 99,
        $offset: 1,
        age: {$gte: 18}
      });
      var query = select.toParamSQL(table);
      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `country` FROM `employees` WHERE `age` >= ? ORDER BY `id` ASC LIMIT 99 OFFSET 1;');
      assert.lengthOf(query.params, 1);
      assert.strictEqual(query.params[0], 18);
    });

  });

});
