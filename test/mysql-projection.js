require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var Projection = require('../src/mysql/query/Projection');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Projection', function () {

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

    it('throws error when $projection is number', function () {
      assert.throws(function () { new Projection(-1); }, /invalid \$projection argument/i);
      assert.throws(function () { new Projection(0); }, /invalid \$projection argument/i);
      assert.throws(function () { new Projection(1); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is boolean', function () {
      assert.throws(function () { new Projection(true); }, /invalid \$projection argument/i);
      assert.throws(function () { new Projection(false); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is string', function () {
      assert.throws(function () { new Projection(''); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is array', function () {
      assert.throws(function () { new Projection([]); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is null', function () {
      assert.throws(function () { new Projection(null); }, /invalid \$projection argument/i);
    });

    it('accepts undefined $projection', function () {
      var projection = new Projection();
      assert.isObject(projection);
      assert.isArray(projection.$include);
      assert.lengthOf(projection.$include, 0);
      assert.isArray(projection.$exclude);
      assert.lengthOf(projection.$exclude, 0);
    });

    it('accepts $projection with inclusive columns', function () {
      var projection = new Projection({name: 1, age: 1});
      assert.isObject(projection);
      assert.isArray(projection.$include);
      assert.sameMembers(projection.$include, ['name', 'age']);
      assert.isArray(projection.$exclude);
      assert.lengthOf(projection.$exclude, 0);
    });

    it('accepts $projection with exclusive columns', function () {
      var projection = new Projection({id: 0});
      assert.isObject(projection);
      assert.isArray(projection.$include);
      assert.lengthOf(projection.$include, 0);
      assert.isArray(projection.$exclude);
      assert.sameMembers(projection.$exclude, ['id']);
    });

    it('accepts a mixture of exclusive + inclusive columns', function () {
      var projection = new Projection({id: 0, name: 1, age: 1});
      assert.isArray(projection.$include);
      assert.sameMembers(projection.$include, ['name', 'age']);
      assert.isArray(projection.$exclude);
      assert.sameMembers(projection.$exclude, ['id']);
    });

  });

  describe('#toParamSQL()', function () {

    it('returns all table columns when $projection is undefined', function () {
      var projection = new Projection();
      var stmt = projection.toParamSQL(table);
      assert.strictEqual(stmt.sql, '`id`, `name`, `age`, `country`');
      assert.lengthOf(stmt.params, 0);
    });

    it('returns $include columns when $include is specified', function () {
      var projection = new Projection({name: 1, age: 1});
      var stmt = projection.toParamSQL(table);
      assert.strictEqual(stmt.sql, '`name`, `age`');
      assert.lengthOf(stmt.params, 0);
    });

    it('returns all columns excluding the $exclude columns when $exclude is specified', function () {
      var projection = new Projection({id: -1});
      var stmt = projection.toParamSQL(table);
      assert.strictEqual(stmt.sql, '`name`, `age`, `country`');
      assert.lengthOf(stmt.params, 0);
    });

    it('ignores the $exclude columns in favor of $include', function () {
      var projection = new Projection({name: 1, age: 1, id: -1});
      var stmt = projection.toParamSQL(table);
      assert.strictEqual(stmt.sql, '`name`, `age`');
      assert.lengthOf(stmt.params, 0);
    });

    it('throws error when $include contains unknown columns', function () {
      var projection = new Projection({unknown: 1});
      assert.throws(function () { projection.toParamSQL(table); }, /unknown column/i);
    });

    it('throws error when $exlude contains unknown columns', function () {
      var projection = new Projection({unknown: -1});
      assert.throws(function () { projection.toParamSQL(table); }, /unknown column/i);
    });

  });

});
