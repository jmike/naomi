var assert = require('chai').assert;
var Values = require('../src/mysql/query/Values');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Values', function () {

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

    it('throws error when $values is Boolean', function () {
      assert.throws(function () { new Values(true); }, /invalid \$values argument/i);
      assert.throws(function () { new Values(false); }, /invalid \$values argument/i);
    });

    it('throws error when $values is String', function () {
      assert.throws(function () { new Values(''); }, /invalid \$values argument/i);
    });

    it('throws error when $values is null', function () {
      assert.throws(function () { new Values(null); }, /invalid \$values argument/i);
    });

    it('throws error when $values is number', function () {
      assert.throws(function () { new Values(123); }, /invalid \$values argument/i);
    });

    it('throws error when $values is empty Object', function () {
      assert.throws(function () { new Values({}); }, /invalid \$values argument/i);
    });

    it('throws error when $values is empty Array', function () {
      assert.throws(function () { new Values([]); }, /invalid \$values argument/i);
    });

    it('throws error when $values array contains number', function () {
      assert.throws(function () { new Values([123]); }, /invalid \$values element/i);
    });

    it('throws error when $values array contains boolean', function () {
      assert.throws(function () { new Values([true]); }, /invalid \$values element/i);
      assert.throws(function () { new Values([false]); }, /invalid \$values element/i);
    });

    it('throws error when $values array contains empty object', function () {
      assert.throws(function () { new Values([{}]); }, /invalid \$values element/i);
    });

    it('accepts undefined $values', function () {
      var values = new Values();
      assert.strictEqual(values._arr, null);
    });

    it('accepts object as $values', function () {
      var values = new Values({id: 1, name: 'John', age: 20});
      assert.lengthOf(values._arr, 1);
      assert.deepEqual(values._arr[0], {id: 1, name: 'John', age: 20});
    });

    it('accepts array as $values', function () {
      var values = new Values([
        {id: 1, name: 'John', age: 20},
        {id: 2, name: 'Maria', age: 30}
      ]);
      assert.lengthOf(values._arr, 2);
      assert.deepEqual(values._arr[0], {id: 1, name: 'John', age: 20});
      assert.deepEqual(values._arr[1], {id: 2, name: 'Maria', age: 30});
    });

  });

  describe('#toParamSQL()', function () {

    it('returns null when $values is undefined', function () {
      var values = new Values();
      var stmt = values.toParamSQL(table);
      assert.strictEqual(stmt, null);
    });

    it('returns params + sql when $values is Object', function () {
      var values = new Values({id: 1, name: 'John', age: 20});
      var stmt = values.toParamSQL(table);
      assert.strictEqual(stmt.sql, '(?, ?, ?)');
      assert.lengthOf(stmt.params, 3);
      assert.strictEqual(stmt.params[0], 1);
      assert.strictEqual(stmt.params[1], 'John');
      assert.strictEqual(stmt.params[2], 20);
    });

    it('returns params + sql when $values is Array', function () {
      var values = new Values([
        {id: 1, name: 'John', age: 20},
        {id: 2, name: 'Maria', age: 30}
      ]);
      var stmt = values.toParamSQL(table);
      assert.strictEqual(stmt.sql, '(?, ?, ?), (?, ?, ?)');
      assert.lengthOf(stmt.params, 6);
      assert.strictEqual(stmt.params[0], 1);
      assert.strictEqual(stmt.params[1], 'John');
      assert.strictEqual(stmt.params[2], 20);
      assert.strictEqual(stmt.params[3], 2);
      assert.strictEqual(stmt.params[4], 'Maria');
      assert.strictEqual(stmt.params[5], 30);
    });

  });

});
