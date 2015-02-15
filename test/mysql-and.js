var assert = require('chai').assert;
var Expression = require('../src/mysql/query/Expression');
var And = require('../src/mysql/query/Expression.And')(Expression);
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL And Expression', function () {

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

    it('throws error when $and is object', function () {
      assert.throws(function () { new And({}); }, /invalid \$and expression/i);
    });

    it('throws error when $and is boolean', function () {
      assert.throws(function () { new And(true); }, /invalid \$and expression/i);
      assert.throws(function () { new And(false); }, /invalid \$and expression/i);
    });

    it('throws error when $and is string', function () {
      assert.throws(function () { new And(''); }, /invalid \$and expression/i);
    });

    it('throws error when $and is null', function () {
      assert.throws(function () { new And(null); }, /invalid \$and expression/i);
    });

    it('throws error when $and is number', function () {
      assert.throws(function () { new And(123); }, /invalid \$and expression/i);
    });

    it('throws error when $and is empty array', function () {
      assert.throws(function () { new And([]); }, /invalid \$and expression/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $and is a valid array', function () {
      var expr = new And([
        {id: 1},
        {name: 'joe'},
        {age: 25}
      ]);
      var query = expr.toParamSQL(table);
      assert.strictEqual(query.sql, '(`id` = ? AND `name` = ? AND `age` = ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'joe');
      assert.strictEqual(query.params[2], 25);
    });

    it('returns valid SQL when $and is a array with nested expressions', function () {
      var expr = new And([
        1,
        {age: {$lte: 25}},
        {$or: [3, {name: 'john'}]}
      ]);
      var query = expr.toParamSQL(table);
      assert.strictEqual(query.sql, '(`id` = ? AND `age` <= ? AND (`id` = ? OR `name` = ?))');
      assert.lengthOf(query.params, 4);
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 25);
      assert.strictEqual(query.params[2], 3);
      assert.strictEqual(query.params[3], 'john');
    });

  });

});
