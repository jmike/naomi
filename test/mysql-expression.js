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

    it('accepts empty object', function () {
      var expression = new Expression();
      assert.deepEqual(expression.value, null);
    });

    it('accepts object with multiple properties', function () {
      var expression = new Expression({id: 1, name: 'Jim'});
      assert.deepEqual(expression.value, {$and: [{id: 1}, {name: 'Jim'}]});
    });

    it('accepts array', function () {
      var expression = new Expression([{id: 1}, {id: 2}]);
      assert.deepEqual(expression.value, {$or: [{id: 1}, {id: 2}]});
    });

    it('accepts Number', function () {
      var expression = new Expression(123);
      assert.deepEqual(expression.value, {$primarykey: 123});
    });

    it('accepts String', function () {
      var expression = new Expression('string');
      assert.deepEqual(expression.value, {$primarykey: 'string'});
    });

    it('accepts Boolean', function () {
      var expression = new Expression(true);
      assert.deepEqual(expression.value, {$primarykey: true});
    });

    it('accepts Date', function () {
      var d = new Date();
      var expression = new Expression(d);
      assert.deepEqual(expression.value, {$primarykey: d});
    });

  });

  describe('$and', function () {

    it('throws error when $and is Object', function () {
      assert.throws(function () { Expression.$and({}); }, /invalid \$and argument/i);
    });

    it('throws error when $and is Boolean', function () {
      assert.throws(function () { Expression.$and(true); }, /invalid \$and argument/i);
      assert.throws(function () { Expression.$and(false); }, /invalid \$and argument/i);
    });

    it('throws error when $and is String', function () {
      assert.throws(function () { Expression.$and(''); }, /invalid \$and argument/i);
    });

    it('throws error when $and is null', function () {
      assert.throws(function () { Expression.$and(null); }, /invalid \$and argument/i);
    });

    it('throws error when $and is number', function () {
      assert.throws(function () { Expression.$and(123); }, /invalid \$and argument/i);
    });

    it('accepts empty array', function () {
      var query = Expression.$and([]);
      assert.strictEqual(query, null);
    });

    it('successfully returns parameterized SQL on valid $and', function () {
      var query = Expression.$and([{id: 1}, {name: 'joe'}, {age: 25}], table);
      assert.strictEqual(query.sql, '(`id` = ? AND `name` = ? AND `age` = ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'joe');
      assert.strictEqual(query.params[2], 25);
    });

  });

  describe('$or', function () {

    it('throws error when $or is Object', function () {
      assert.throws(function () { Expression.$or({}); }, /invalid \$or argument/i);
    });

    it('throws error when $or is Boolean', function () {
      assert.throws(function () { Expression.$or(true); }, /invalid \$or argument/i);
      assert.throws(function () { Expression.$or(false); }, /invalid \$or argument/i);
    });

    it('throws error when $or is String', function () {
      assert.throws(function () { Expression.$or(''); }, /invalid \$or argument/i);
    });

    it('throws error when $or is null', function () {
      assert.throws(function () { Expression.$or(null); }, /invalid \$or argument/i);
    });

    it('throws error when $or is number', function () {
      assert.throws(function () { Expression.$or(123); }, /invalid \$or argument/i);
    });

    it('accepts empty array', function () {
      var query = Expression.$or([]);
      assert.strictEqual(query, null);
    });

    it('successfully returns parameterized SQL on valid $or', function () {
      var query = Expression.$or([{id: 1}, {name: 'joe'}, {age: 25}], table);
      assert.strictEqual(query.sql, '(`id` = ? OR `name` = ? OR `age` = ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'joe');
      assert.strictEqual(query.params[2], 25);
    });

  });

  describe('$eq', function () {

    it('throws error when $eq is Object', function () {
      assert.throws(function () { Expression.$eq({}); }, /invalid \$eq argument/i);
    });

    it('throws error when $eq is Array', function () {
      assert.throws(function () { Expression.$eq([]); }, /invalid \$eq argument/i);
    });

    it('accepts null values', function () {
      var query = Expression.$eq(null);
      assert.strictEqual(query.sql, 'IS NULL');
      assert.lengthOf(query.params, 0);
    });

    it('successfully returns parameterized SQL on valid $eq', function () {
      var query = Expression.$eq(123);
      assert.strictEqual(query.sql, '= ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$ne', function () {

    it('throws error when $ne is Object', function () {
      assert.throws(function () { Expression.$ne({}); }, /invalid \$ne argument/i);
    });

    it('throws error when $ne is Array', function () {
      assert.throws(function () { Expression.$ne([]); }, /invalid \$ne argument/i);
    });

    it('accepts null values', function () {
      var query = Expression.$ne(null);
      assert.strictEqual(query.sql, 'IS NOT NULL');
      assert.lengthOf(query.params, 0);
    });

    it('successfully returns parameterized SQL on valid $ne', function () {
      var query = Expression.$ne(123);
      assert.strictEqual(query.sql, '!= ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$gt', function () {

    it('throws error when $gt is Object', function () {
      assert.throws(function () { Expression.$gt({}); }, /invalid \$gt argument/i);
    });

    it('throws error when $gt is Array', function () {
      assert.throws(function () { Expression.$gt([]); }, /invalid \$gt argument/i);
    });

    it('throws error when $gt is null', function () {
      assert.throws(function () { Expression.$gt(null); }, /invalid \$gt argument/i);
    });

    it('successfully returns parameterized SQL on valid $gt', function () {
      var query = Expression.$gt(123);
      assert.strictEqual(query.sql, '> ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$gte', function () {

    it('throws error when $gte is Object', function () {
      assert.throws(function () { Expression.$gte({}); }, /invalid \$gte argument/i);
    });

    it('throws error when $gte is Array', function () {
      assert.throws(function () { Expression.$gte([]); }, /invalid \$gte argument/i);
    });

    it('throws error when $gte is null', function () {
      assert.throws(function () { Expression.$gte(null); }, /invalid \$gte argument/i);
    });

    it('successfully returns parameterized SQL on valid $gte', function () {
      var query = Expression.$gte(123);
      assert.strictEqual(query.sql, '>= ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$lt', function () {

    it('throws error when $lt is Object', function () {
      assert.throws(function () { Expression.$lt({}); }, /invalid \$lt argument/i);
    });

    it('throws error when $lt is Array', function () {
      assert.throws(function () { Expression.$lt([]); }, /invalid \$lt argument/i);
    });

    it('throws error when $lt is null', function () {
      assert.throws(function () { Expression.$lt(null); }, /invalid \$lt argument/i);
    });

    it('successfully returns parameterized SQL on valid $lt', function () {
      var query = Expression.$lt(123);
      assert.strictEqual(query.sql, '< ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$lte', function () {

    it('throws error when $lte is Object', function () {
      assert.throws(function () { Expression.$lte({}); }, /invalid \$lte argument/i);
    });

    it('throws error when $lte is Array', function () {
      assert.throws(function () { Expression.$lte([]); }, /invalid \$lte argument/i);
    });

    it('throws error when $lte is null', function () {
      assert.throws(function () { Expression.$lte(null); }, /invalid \$lte argument/i);
    });

    it('successfully returns parameterized SQL on valid $lte', function () {
      var query = Expression.$lte(123);
      assert.strictEqual(query.sql, '<= ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$in', function () {

    it('throws error when $in is Object', function () {
      assert.throws(function () { Expression.$in({}); }, /invalid \$in argument/i);
    });

    it('throws error when $in is Boolean', function () {
      assert.throws(function () { Expression.$in(true); }, /invalid \$in argument/i);
      assert.throws(function () { Expression.$in(false); }, /invalid \$in argument/i);
    });

    it('throws error when $in is String', function () {
      assert.throws(function () { Expression.$in(''); }, /invalid \$in argument/i);
    });

    it('throws error when $in is null', function () {
      assert.throws(function () { Expression.$in(null); }, /invalid \$in argument/i);
    });

    it('throws error when $in is number', function () {
      assert.throws(function () { Expression.$in(123); }, /invalid \$in argument/i);
    });

    it('throws error when $in is empty Array', function () {
      assert.throws(function () { Expression.$in([]); }, /invalid \$in argument/i);
    });

    it('successfully returns parameterized SQL on valid $in', function () {
      var d = new Date();
      var query = Expression.$in([1, 'string', true, d]);
      assert.strictEqual(query.sql, 'IN (?, ?, ?, ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'string');
      assert.strictEqual(query.params[2], true);
      assert.strictEqual(query.params[3], d);
    });

  });

  describe('$nin', function () {

    it('throws error when $nin is Object', function () {
      assert.throws(function () { Expression.$nin({}); }, /invalid \$nin argument/i);
    });

    it('throws error when $nin is Boolean', function () {
      assert.throws(function () { Expression.$nin(true); }, /invalid \$nin argument/i);
      assert.throws(function () { Expression.$nin(false); }, /invalid \$nin argument/i);
    });

    it('throws error when $nin is String', function () {
      assert.throws(function () { Expression.$nin(''); }, /invalid \$nin argument/i);
    });

    it('throws error when $nin is null', function () {
      assert.throws(function () { Expression.$nin(null); }, /invalid \$nin argument/i);
    });

    it('throws error when $nin is number', function () {
      assert.throws(function () { Expression.$nin(123); }, /invalid \$nin argument/i);
    });

    it('throws error when $nin is empty Array', function () {
      assert.throws(function () { Expression.$nin([]); }, /invalid \$nin argument/i);
    });

    it('successfully returns parameterized SQL on valid $nin', function () {
      var d = new Date();
      var query = Expression.$nin([1, 'string', true, d, null]);
      assert.strictEqual(query.sql, 'NOT IN (?, ?, ?, ?, ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'string');
      assert.strictEqual(query.params[2], true);
      assert.strictEqual(query.params[3], d);
      assert.strictEqual(query.params[4], null);
    });

  });

  describe('$like', function () {

    it('throws error when $like is Object', function () {
      assert.throws(function () { Expression.$like({}); }, /invalid \$like argument/i);
    });

    it('throws error when $like is Array', function () {
      assert.throws(function () { Expression.$like([]); }, /invalid \$like argument/i);
    });

    it('throws error when $like is null', function () {
      assert.throws(function () { Expression.$like(null); }, /invalid \$like argument/i);
    });

    it('throws error when $like is Number', function () {
      assert.throws(function () { Expression.$like(123); }, /invalid \$like argument/i);
    });

    it('throws error when $like is Date', function () {
      assert.throws(function () { Expression.$like(new Date()); }, /invalid \$like argument/i);
    });

    it('successfully returns parameterized SQL on valid $like', function () {
      var query = Expression.$like('%tag%');
      assert.strictEqual(query.sql, 'LIKE ?');
      assert.strictEqual(query.params[0], '%tag%');
    });

  });

});
