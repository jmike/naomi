var assert = require('chai').assert;
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');
var QueryBuilder = require('../src/mysql/QueryBuilder');

describe('MySQL QueryBuilder', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  var querybuilder = new QueryBuilder(table);

  describe('constructor', function () {

    it('throws error when table is not a Table instance', function () {
      assert.throws(function () { new QueryBuilder({}); }, /invalid table argument/i);
    });

  });

  describe('$projection()', function () {

    it('accepts empty $projection', function () {
      var query = querybuilder.$projection({$include: [], $exclude: []});
      assert.strictEqual(query, '`id`, `name`, `age`, `country`');
    });

    it('accepts $projection with inclusive columns', function () {
      var query = querybuilder.$projection({$include: ['name', 'age'], $exclude: []});
      assert.strictEqual(query, '`name`, `age`');
    });

    it('accepts $projection with exclusive columns', function () {
      var query = querybuilder.$projection({$include: [], $exclude: ['id']});
      assert.strictEqual(query, '`name`, `age`, `country`');
    });

    it('accepts a mixture of exclusive and inclusive columns, but ignores the exclusive columns', function () {
      var query = querybuilder.$projection({$include: ['name', 'age'], $exclude: ['id']});
      assert.strictEqual(query, '`name`, `age`');
    });

  });

  describe('$orderby()', function () {

    it('accepts empty $orderby', function () {
      var query = querybuilder.$orderby([]);
      assert.strictEqual(query, null);
    });

    it('successfully returns an ORDER BY statement given a valid $orderby', function () {
      var query = querybuilder.$orderby([{name: 1}, {id: -1}]);
      assert.strictEqual(query, '`name` ASC, `id` DESC');
    });

  });

  describe('$and', function () {

    it('throws error when $and is Object', function () {
      assert.throws(function () { querybuilder.$and({}); }, /invalid value for \$and expression/i);
    });

    it('throws error when $and is Boolean', function () {
      assert.throws(function () { querybuilder.$and(true); }, /invalid value for \$and expression/i);
      assert.throws(function () { querybuilder.$and(false); }, /invalid value for \$and expression/i);
    });

    it('throws error when $and is String', function () {
      assert.throws(function () { querybuilder.$and(''); }, /invalid value for \$and expression/i);
    });

    it('throws error when $and is null', function () {
      assert.throws(function () { querybuilder.$and(null); }, /invalid value for \$and expression/i);
    });

    it('throws error when $and is number', function () {
      assert.throws(function () { querybuilder.$and(123); }, /invalid value for \$and expression/i);
    });

    it('accepts empty array', function () {
      var query = querybuilder.$and([]);
      assert.strictEqual(query, null);
    });

    it('successfully returns parameterized SQL on valid $and', function () {
      var query = querybuilder.$and([{id: 1}, {name: 'joe'}, {age: 25}]);
      assert.strictEqual(query.sql, '(`id` = ? AND `name` = ? AND `age` = ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'joe');
      assert.strictEqual(query.params[2], 25);
    });

  });

  describe('$or', function () {

    it('throws error when $or is Object', function () {
      assert.throws(function () { querybuilder.$or({}); }, /invalid value for \$or expression/i);
    });

    it('throws error when $or is Boolean', function () {
      assert.throws(function () { querybuilder.$or(true); }, /invalid value for \$or expression/i);
      assert.throws(function () { querybuilder.$or(false); }, /invalid value for \$or expression/i);
    });

    it('throws error when $or is String', function () {
      assert.throws(function () { querybuilder.$or(''); }, /invalid value for \$or expression/i);
    });

    it('throws error when $or is null', function () {
      assert.throws(function () { querybuilder.$or(null); }, /invalid value for \$or expression/i);
    });

    it('throws error when $or is number', function () {
      assert.throws(function () { querybuilder.$or(123); }, /invalid value for \$or expression/i);
    });

    it('accepts empty array', function () {
      var query = querybuilder.$or([]);
      assert.strictEqual(query, null);
    });

    it('successfully returns parameterized SQL on valid $or', function () {
      var query = querybuilder.$or([{id: 1}, {name: 'joe'}, {age: 25}]);
      assert.strictEqual(query.sql, '(`id` = ? OR `name` = ? OR `age` = ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'joe');
      assert.strictEqual(query.params[2], 25);
    });

  });

  describe('$eq', function () {

    it('throws error when $eq is Object', function () {
      assert.throws(function () { querybuilder.$eq({}); }, /invalid value for \$eq expression/i);
    });

    it('throws error when $eq is Array', function () {
      assert.throws(function () { querybuilder.$eq([]); }, /invalid value for \$eq expression/i);
    });

    it('accepts null values', function () {
      var query = querybuilder.$eq(null);
      assert.strictEqual(query.sql, 'IS NULL');
      assert.lengthOf(query.params, 0);
    });

    it('successfully returns parameterized SQL on valid $eq', function () {
      var query = querybuilder.$eq(123);
      assert.strictEqual(query.sql, '= ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$ne', function () {

    it('throws error when $ne is Object', function () {
      assert.throws(function () { querybuilder.$ne({}); }, /invalid value for \$ne expression/i);
    });

    it('throws error when $ne is Array', function () {
      assert.throws(function () { querybuilder.$ne([]); }, /invalid value for \$ne expression/i);
    });

    it('accepts null values', function () {
      var query = querybuilder.$ne(null);
      assert.strictEqual(query.sql, 'IS NOT NULL');
      assert.lengthOf(query.params, 0);
    });

    it('successfully returns parameterized SQL on valid $ne', function () {
      var query = querybuilder.$ne(123);
      assert.strictEqual(query.sql, '!= ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$gt', function () {

    it('throws error when $gt is Object', function () {
      assert.throws(function () { querybuilder.$gt({}); }, /invalid value for \$gt expression/i);
    });

    it('throws error when $gt is Array', function () {
      assert.throws(function () { querybuilder.$gt([]); }, /invalid value for \$gt expression/i);
    });

    it('throws error when $gt is null', function () {
      assert.throws(function () { querybuilder.$gt(null); }, /invalid value for \$gt expression/i);
    });

    it('successfully returns parameterized SQL on valid $gt', function () {
      var query = querybuilder.$gt(123);
      assert.strictEqual(query.sql, '> ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$gte', function () {

    it('throws error when $gte is Object', function () {
      assert.throws(function () { querybuilder.$gte({}); }, /invalid value for \$gte expression/i);
    });

    it('throws error when $gte is Array', function () {
      assert.throws(function () { querybuilder.$gte([]); }, /invalid value for \$gte expression/i);
    });

    it('throws error when $gte is null', function () {
      assert.throws(function () { querybuilder.$gte(null); }, /invalid value for \$gte expression/i);
    });

    it('successfully returns parameterized SQL on valid $gte', function () {
      var query = querybuilder.$gte(123);
      assert.strictEqual(query.sql, '>= ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$lt', function () {

    it('throws error when $lt is Object', function () {
      assert.throws(function () { querybuilder.$lt({}); }, /invalid value for \$lt expression/i);
    });

    it('throws error when $lt is Array', function () {
      assert.throws(function () { querybuilder.$lt([]); }, /invalid value for \$lt expression/i);
    });

    it('throws error when $lt is null', function () {
      assert.throws(function () { querybuilder.$lt(null); }, /invalid value for \$lt expression/i);
    });

    it('successfully returns parameterized SQL on valid $lt', function () {
      var query = querybuilder.$lt(123);
      assert.strictEqual(query.sql, '< ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$lte', function () {

    it('throws error when $lte is Object', function () {
      assert.throws(function () { querybuilder.$lte({}); }, /invalid value for \$lte expression/i);
    });

    it('throws error when $lte is Array', function () {
      assert.throws(function () { querybuilder.$lte([]); }, /invalid value for \$lte expression/i);
    });

    it('throws error when $lte is null', function () {
      assert.throws(function () { querybuilder.$lte(null); }, /invalid value for \$lte expression/i);
    });

    it('successfully returns parameterized SQL on valid $lte', function () {
      var query = querybuilder.$lte(123);
      assert.strictEqual(query.sql, '<= ?');
      assert.strictEqual(query.params[0], 123);
    });

  });

  describe('$in', function () {

    it('throws error when $in is Object', function () {
      assert.throws(function () { querybuilder.$in({}); }, /invalid value for \$in expression/i);
    });

    it('throws error when $in is Boolean', function () {
      assert.throws(function () { querybuilder.$in(true); }, /invalid value for \$in expression/i);
      assert.throws(function () { querybuilder.$in(false); }, /invalid value for \$in expression/i);
    });

    it('throws error when $in is String', function () {
      assert.throws(function () { querybuilder.$in(''); }, /invalid value for \$in expression/i);
    });

    it('throws error when $in is null', function () {
      assert.throws(function () { querybuilder.$in(null); }, /invalid value for \$in expression/i);
    });

    it('throws error when $in is number', function () {
      assert.throws(function () { querybuilder.$in(123); }, /invalid value for \$in expression/i);
    });

    it('throws error when $in is empty Array', function () {
      assert.throws(function () { querybuilder.$in([]); }, /invalid value for \$in expression/i);
    });

    it('successfully returns parameterized SQL on valid $in', function () {
      var d = new Date();
      var query = querybuilder.$in([1, 'string', true, d]);
      assert.strictEqual(query.sql, 'IN (?, ?, ?, ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 'string');
      assert.strictEqual(query.params[2], true);
      assert.strictEqual(query.params[3], d);
    });

  });

  describe('$nin', function () {

    it('throws error when $nin is Object', function () {
      assert.throws(function () { querybuilder.$nin({}); }, /invalid value for \$nin expression/i);
    });

    it('throws error when $nin is Boolean', function () {
      assert.throws(function () { querybuilder.$nin(true); }, /invalid value for \$nin expression/i);
      assert.throws(function () { querybuilder.$nin(false); }, /invalid value for \$nin expression/i);
    });

    it('throws error when $nin is String', function () {
      assert.throws(function () { querybuilder.$nin(''); }, /invalid value for \$nin expression/i);
    });

    it('throws error when $nin is null', function () {
      assert.throws(function () { querybuilder.$nin(null); }, /invalid value for \$nin expression/i);
    });

    it('throws error when $nin is number', function () {
      assert.throws(function () { querybuilder.$nin(123); }, /invalid value for \$nin expression/i);
    });

    it('throws error when $nin is empty Array', function () {
      assert.throws(function () { querybuilder.$nin([]); }, /invalid value for \$nin expression/i);
    });

    it('successfully returns parameterized SQL on valid $nin', function () {
      var d = new Date();
      var query = querybuilder.$nin([1, 'string', true, d, null]);
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
      assert.throws(function () { querybuilder.$like({}); }, /invalid value for \$like expression/i);
    });

    it('throws error when $like is Array', function () {
      assert.throws(function () { querybuilder.$like([]); }, /invalid value for \$like expression/i);
    });

    it('throws error when $like is null', function () {
      assert.throws(function () { querybuilder.$like(null); }, /invalid value for \$like expression/i);
    });

    it('throws error when $like is Number', function () {
      assert.throws(function () { querybuilder.$like(123); }, /invalid value for \$like expression/i);
    });

    it('throws error when $like is Date', function () {
      assert.throws(function () { querybuilder.$like(new Date()); }, /invalid value for \$like expression/i);
    });

    it('successfully returns parameterized SQL on valid $like', function () {
      var query = querybuilder.$like('%tag%');
      assert.strictEqual(query.sql, 'LIKE ?');
      assert.strictEqual(query.params[0], '%tag%');
    });

  });

  describe('$primarykey', function () {

    it('resolves to the table\'s primary key', function () {
      var query = querybuilder.$primarykey({'$lte': 10});
      assert.strictEqual(query.sql, '`id` <= ?');
      assert.strictEqual(query.params[0], 10);
    });

  });

  describe('#select()', function () {

    it('returns a valid SQL with no specific $query properties', function () {
      var query = querybuilder.select({
        $projection: {
          $include: [],
          $exclude: []
        },
        $orderby: [],
        $limit: null,
        $offset: null
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees`;');
    });

    it('returns a valid SQL with $include specified', function () {
      var query = querybuilder.select({
        $projection: {
          $include: ['id'],
          $exclude: []
        },
        $orderby: [],
        $limit: null,
        $offset: null
      });

      assert.strictEqual(query.sql, 'SELECT `id` FROM `employees`;');
    });

    it('returns a valid SQL with $exclude specified', function () {
      var query = querybuilder.select({
        $projection: {
          $include: [],
          $exclude: ['age']
        },
        $orderby: [],
        $limit: null,
        $offset: null
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `country` FROM `employees`;');
    });

    it('returns a valid SQL with $orderby specified', function () {
      var query = querybuilder.select({
        $projection: {
          $include: [],
          $exclude: []
        },
        $orderby: [{age: -1}, {id: 1}],
        $limit: null,
        $offset: null
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees` ORDER BY `age` DESC, `id` ASC;');
    });

    it('returns a valid SQL with $limit specified', function () {
      var query = querybuilder.select({
        $projection: {
          $include: [],
          $exclude: []
        },
        $orderby: [],
        $limit: 10,
        $offset: null
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees` LIMIT 10;');
    });

    it('returns a valid SQL with $limit + $offset specified', function () {
      var query = querybuilder.select({
        $projection: {
          $include: [],
          $exclude: []
        },
        $orderby: [],
        $limit: 10,
        $offset: 5
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees` LIMIT 10 OFFSET 5;');
    });

    it('returns a valid SQL with $offset only when $limit is also specified', function () {
      var query = querybuilder.select({
        $projection: {
          $include: [],
          $exclude: []
        },
        $orderby: [],
        $limit: null,
        $offset: 5
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees`;');
    });

    it('returns a valid SQL with $filter specified', function () {
      var query = querybuilder.select({
        $projection: {
          $include: [],
          $exclude: []
        },
        $orderby: [],
        $limit: null,
        $offset: null,
        $filter: {$and: [{$or: [{id: 1}, {id: {$lte: 10}}]}, {age: {$in: [20, 30, 40]}}]}
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees` WHERE ((`id` = ? OR `id` <= ?) AND `age` IN (?, ?, ?));');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 10);
      assert.strictEqual(query.params[2], 20);
      assert.strictEqual(query.params[3], 30);
      assert.strictEqual(query.params[4], 40);
    });

    it('returns a valid SQL with $primarykey specified', function () {
      var query = querybuilder.select({
        $projection: {
          $include: [],
          $exclude: []
        },
        $orderby: [],
        $limit: null,
        $offset: null,
        $filter: {$primarykey: 10}
      });

      assert.strictEqual(query.sql, 'SELECT `id`, `name`, `age`, `country` FROM `employees` WHERE `id` = ?;');
      assert.strictEqual(query.params[0], 10);
    });

  });

});
