var assert = require('chai').assert;
var Expression = require('../src/mysql/query/Expression');
var Or = require('../src/mysql/query/Expression.Or')(Expression);
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Or Expression', function () {

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

    it('throws error when $or is object', function () {
      assert.throws(function () { new Or({}); }, /invalid \$or expression/i);
    });

    it('throws error when $or is boolean', function () {
      assert.throws(function () { new Or(true); }, /invalid \$or expression/i);
      assert.throws(function () { new Or(false); }, /invalid \$or expression/i);
    });

    it('throws error when $or is string', function () {
      assert.throws(function () { new Or(''); }, /invalid \$or expression/i);
    });

    it('throws error when $or is null', function () {
      assert.throws(function () { new Or(null); }, /invalid \$or expression/i);
    });

    it('throws error when $or is number', function () {
      assert.throws(function () { new Or(123); }, /invalid \$or expression/i);
    });

    it('throws error when $or is empty array', function () {
      assert.throws(function () { new Or([]); }, /invalid \$or expression/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $or is a valid array', function () {
      var expr = new Or([
        {id: 1},
        {name: 'joe'},
        {age: 25}
      ]);
      var query = expr.toParamSQL(table);
      assert.strictEqual(query.sql, '(`id` = ? OR `name` = ? OR `age` = ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'joe');
      assert.strictEqual(query.params[2], 25);
    });

  });

});
