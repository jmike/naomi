var assert = require('chai').assert;
var OrderBy = require('../src/mysql/query/OrderBy');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL OrderBy', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  describe('contructor', function () {

    it('throws error when $orderby is object', function () {
      assert.throws(function () { new OrderBy({}); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby is boolean', function () {
      assert.throws(function () { new OrderBy(true); }, /invalid \$orderby argument/i);
      assert.throws(function () { new OrderBy(false); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby is string', function () {
      assert.throws(function () { new OrderBy(''); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby is null', function () {
      assert.throws(function () { new OrderBy(null); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby is number', function () {
      assert.throws(function () { new OrderBy(123); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby contains number', function () {
      assert.throws(function () { new OrderBy([123]); }, /invalid \$orderby element/i);
    });

    it('throws error when $orderby contains boolean', function () {
      assert.throws(function () { new OrderBy([true]); }, /invalid \$orderby element/i);
      assert.throws(function () { new OrderBy([false]); }, /invalid \$orderby element/i);
    });

    it('throws error when $orderby contains empty object', function () {
      assert.throws(function () { new OrderBy([{}]); }, /invalid \$orderby element/i);
    });

    it('throws error when $orderby contains object with > 1 elements', function () {
      assert.throws(function () { new OrderBy([{a: 1, b: 1}]); }, /invalid \$orderby element/i);
    });

    it('throws error when $orderby contains object with invalid value', function () {
      assert.throws(function () { new OrderBy([{a: 0}]); }, /invalid \$orderby element/i);
      assert.throws(function () { new OrderBy([{a: 2}]); }, /invalid \$orderby element/i);
      assert.throws(function () { new OrderBy([{a: -2}]); }, /invalid \$orderby element/i);
    });

    it('accepts undefined $orderby', function () {
      var orderby = OrderBy.fromObject({});
      assert.isArray(orderby._arr);
      assert.lengthOf(orderby._arr, 0);
    });

    it('accepts empty $orderby', function () {
      var orderby = new OrderBy([]);
      assert.isArray(orderby._arr);
      assert.lengthOf(orderby._arr, 0);
    });

    it('accepts string $orderby element', function () {
      var orderby = new OrderBy(['id']);
      assert.isArray(orderby._arr);
      assert.lengthOf(orderby._arr, 1);
      assert.deepEqual(orderby._arr[0], {id: 1});
    });

    it('accepts object $orderby element', function () {
      var orderby = new OrderBy([{name: -1}]);
      assert.isArray(orderby._arr);
      assert.lengthOf(orderby._arr, 1);
      assert.deepEqual(orderby._arr[0], {name: -1});
    });

    it('accepts mixture of string and object $orderby elements', function () {
      var orderby = new OrderBy(['id', {name: -1}]);
      assert.isArray(orderby._arr);
      assert.lengthOf(orderby._arr, 2);
      assert.deepEqual(orderby._arr[0], {id: 1});
      assert.deepEqual(orderby._arr[1], {name: -1});
    });

  });

  describe('#toParamSQL()', function () {

    it('returns null when $orderby is undefined', function () {
      var orderby = new OrderBy();
      var stmt = orderby.toParamSQL(table);
      assert.strictEqual(stmt, null);
    });

    it('successfully returns sql given a valid $orderby', function () {
      var orderby = new OrderBy([{name: 1}, {id: -1}]);
      var stmt = orderby.toParamSQL(table);
      assert.strictEqual(stmt.sql, '`name` ASC, `id` DESC');
      assert.lengthOf(stmt.params, 0);
    });

  });

});
