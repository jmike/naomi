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

    it('throws error on array $expression', function () {
      assert.throws(function () { new Expression([]); }, /invalid \$expression/i);
    });

    it('throws error on null $expression', function () {
      assert.throws(function () { new Expression(null); }, /invalid \$expression/i);
    });

    it('accepts undefined $expression', function () {
      var expression = new Expression();
      assert.deepEqual(expression._v, null);
    });

    it('accepts object $expression', function () {
      var obj = {name: 'Jim'};
      var expression = new Expression(obj);
      assert.deepEqual(expression._v, obj);
    });

    it('accepts empty object $expression', function () {
      var expression = new Expression({});
      assert.deepEqual(expression._v, null);
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

  describe('#toParamSQL', function () {

    it('returns valid SQL when $expression is number', function () {
      var expression = new Expression(1);
      var query = expression.toParamSQL(table);
      assert.strictEqual(query.sql, '`id` = ?');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns valid SQL when $expression is string', function () {
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

    it('returns valid SQL when $expression contains $id', function () {
      var expression = new Expression({$id: {$lte: 20}});
      var query = expression.toParamSQL(table);
      assert.strictEqual(query.sql, '`id` <= ?');
      assert.strictEqual(query.params[0], 20);
    });

  });

});
