var assert = require('chai').assert;
var Expression = require('../src/mysql/query/Expression');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Expression', function () {

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

    it('accepts undefined $expression', function () {
      var expression = new Expression();
      assert.deepEqual(expression._v, null);
    });

    it('accepts object $expression', function () {
      var expression = new Expression({id: 1, name: 'Jim'});
      assert.deepEqual(expression._v, {$and: [{id: 1}, {name: 'Jim'}]});
    });

    it('accepts array $expression', function () {
      var expression = new Expression([{id: 1}, {id: 2}]);
      assert.deepEqual(expression._v, {$or: [{id: 1}, {id: 2}]});
    });

    it('accepts number $expression', function () {
      var expression = new Expression(123);
      assert.deepEqual(expression._v, {$id: 123});
    });

    it('accepts string $expression', function () {
      var expression = new Expression('string');
      assert.deepEqual(expression._v, {$id: 'string'});
    });

    it('accepts boolean $expression', function () {
      var expression = new Expression(true);
      assert.deepEqual(expression._v, {$id: true});
    });

    it('accepts date $expression', function () {
      var d = new Date();
      var expression = new Expression(d);
      assert.deepEqual(expression._v, {$id: d});
    });

    it('accepts buffer $expression', function () {
      var buf = new Buffer('abcde');
      var expression = new Expression(buf);
      assert.deepEqual(expression._v, {$id: buf});
    });

  });

  describe('And Expression', function () {

    it('throws error when $and is object', function () {
      assert.throws(function () { new Expression.And({}); }, /invalid \$and argument/i);
    });

    it('throws error when $and is boolean', function () {
      assert.throws(function () { new Expression.And(true); }, /invalid \$and argument/i);
      assert.throws(function () { new Expression.And(false); }, /invalid \$and argument/i);
    });

    it('throws error when $and is string', function () {
      assert.throws(function () { new Expression.And(''); }, /invalid \$and argument/i);
    });

    it('throws error when $and is null', function () {
      assert.throws(function () { new Expression.And(null); }, /invalid \$and argument/i);
    });

    it('throws error when $and is number', function () {
      assert.throws(function () { new Expression.And(123); }, /invalid \$and argument/i);
    });

    it('throws error when $and is empty array', function () {
      assert.throws(function () { new Expression.And([]); }, /invalid \$and argument/i);
    });

  });

  describe('Or Expression', function () {

    it('throws error when $or is object', function () {
      assert.throws(function () { new Expression.Or({}); }, /invalid \$or argument/i);
    });

    it('throws error when $or is boolean', function () {
      assert.throws(function () { new Expression.Or(true); }, /invalid \$or argument/i);
      assert.throws(function () { new Expression.Or(false); }, /invalid \$or argument/i);
    });

    it('throws error when $or is string', function () {
      assert.throws(function () { new Expression.Or(''); }, /invalid \$or argument/i);
    });

    it('throws error when $or is null', function () {
      assert.throws(function () { new Expression.Or(null); }, /invalid \$or argument/i);
    });

    it('throws error when $or is number', function () {
      assert.throws(function () { new Expression.Or(123); }, /invalid \$or argument/i);
    });

    it('throws error when $or is empty array', function () {
      assert.throws(function () { new Expression.Or([]); }, /invalid \$or argument/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $expression is plain number', function () {
      var expression = new Expression(1);
      var query = expression.toParamSQL(table);
      assert.strictEqual(query.sql, '`id` = ?');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns valid SQL when $expression is plain string', function () {
      var expression = new Expression('string');
      var query = expression.toParamSQL(table);
      assert.strictEqual(query.sql, '`id` = ?');
      assert.strictEqual(query.params[0], 'string');
    });

    it('returns valid SQL when $expression is date', function () {
      var d = new Date();
      var expression = new Expression(d);
      var query = expression.toParamSQL(table);
      assert.strictEqual(query.sql, '`id` = ?');
      assert.strictEqual(query.params[0], d);
    });

    it('returns valid SQL when $expression is boolean', function () {
      var expression = new Expression(true);
      var query = expression.toParamSQL(table);
      assert.strictEqual(query.sql, '`id` = ?');
      assert.strictEqual(query.params[0], true);
    });

    it('returns valid SQL when $expression is buffer', function () {
      var buf =  new Buffer('abcdef');
      var expression = new Expression(buf);
      var query = expression.toParamSQL(table);
      assert.strictEqual(query.sql, '`id` = ?');
      assert.strictEqual(query.params[0], buf);
    });

    it('returns valid SQL when $expression contains the $id keyword', function () {
      var expression = new Expression({$lte: {$id: 20}});
      var query = expression.toParamSQL(table);
      assert.strictEqual(query.sql, '`id` <= ?');
      assert.strictEqual(query.params[0], 20);
    });

    it('returns valid SQL when $expression is object with $and property', function () {
      var expression = new Expression({
        $and: [
          {id: 1},
          {name: 'joe'},
          {age: 25}
        ]
      });
      var query = expression.toParamSQL(table);
      assert.strictEqual(query.sql, '(`id` = ? AND `name` = ? AND `age` = ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'joe');
      assert.strictEqual(query.params[2], 25);
    });

    it('returns valid SQL when $expression is object with $or property', function () {
      var query = new Expression({
        $or: [
          {id: 1},
          {name: 'joe'},
          {age: 25}
        ]
      }).toParamSQL(table);
      assert.strictEqual(query.sql, '(`id` = ? OR `name` = ? OR `age` = ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'joe');
      assert.strictEqual(query.params[2], 25);
    });

  });

});
