require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var Projection = require('../src/mysql/query/Projection');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('Projection', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  describe('#fromQuery()', function () {

    it('throws error when $projection is Number', function () {
      assert.throws(function () { Projection.fromQuery({$projection: -1}); }, /invalid \$projection argument/i);
      assert.throws(function () { Projection.fromQuery({$projection: 0}); }, /invalid \$projection argument/i);
      assert.throws(function () { Projection.fromQuery({$projection: 1}); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is Boolean', function () {
      assert.throws(function () { Projection.fromQuery({$projection: true}); }, /invalid \$projection argument/i);
      assert.throws(function () { Projection.fromQuery({$projection: false}); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is String', function () {
      assert.throws(function () { Projection.fromQuery({$projection: ''}); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is Array', function () {
      assert.throws(function () { Projection.fromQuery({$projection: []}); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is null', function () {
      assert.throws(function () { Projection.fromQuery({$projection: null}); }, /invalid \$projection argument/i);
    });

    it('accepts empty $projection', function () {
      var $projection = Projection.fromQuery({});
      assert.isObject($projection);
      assert.isArray($projection.$include);
      assert.lengthOf($projection.$include, 0);
      assert.isArray($projection.$exclude);
      assert.lengthOf($projection.$exclude, 0);
    });

    it('accepts $projection with inclusive columns', function () {
      var $projection = Projection.fromQuery({$projection: {name: 1, age: 1}});
      assert.isObject($projection);
      assert.isArray($projection.$include);
      assert.sameMembers($projection.$include, ['name', 'age']);
      assert.isArray($projection.$exclude);
      assert.lengthOf($projection.$exclude, 0);
    });

    it('accepts $projection with exclusive columns', function () {
      var $projection = Projection.fromQuery({$projection: {id: 0}});
      assert.isObject($projection);
      assert.isArray($projection.$include);
      assert.lengthOf($projection.$include, 0);
      assert.isArray($projection.$exclude);
      assert.sameMembers($projection.$exclude, ['id']);
    });

    it('accepts a mixture of exclusive and inclusive columns', function () {
      var $projection = Projection.fromQuery({$projection: {id: 0, name: 1, age: 1}});
      assert.isArray($projection.$include);
      assert.sameMembers($projection.$include, ['name', 'age']);
      assert.isArray($projection.$exclude);
      assert.sameMembers($projection.$exclude, ['id']);
    });

  });

  describe('#buildSQL()', function () {

    it('returns all table columns when $include and $exclude is empty', function () {
      var projection = new Projection();
      var stmt = projection.buildSQL(table);
      assert.strictEqual(stmt.sql, '`id`, `name`, `age`, `country`');
      assert.lengthOf(stmt.params, 0);
    });

    it('returns only the $include columns when $include is specified', function () {
      var projection = new Projection(['name', 'age']);
      var stmt = projection.buildSQL(table);
      assert.strictEqual(stmt.sql, '`name`, `age`');
      assert.lengthOf(stmt.params, 0);
    });

    it('returns all columns minus the $exclude columns when $exclude is specified', function () {
      var projection = new Projection(null, ['id']);
      var stmt = projection.buildSQL(table);
      assert.strictEqual(stmt.sql, '`name`, `age`, `country`');
      assert.lengthOf(stmt.params, 0);
    });

    it('ignores the $exclude columns in favor of $include', function () {
      var projection = new Projection(['name', 'age'], ['id']);
      var stmt = projection.buildSQL(table);
      assert.strictEqual(stmt.sql, '`name`, `age`');
      assert.lengthOf(stmt.params, 0);
    });

    it('throws error when $include contains unknown columns', function () {
      var projection = new Projection(['unknown']);
      assert.throws(function () { projection.buildSQL(table); }, /unknown column/i);
    });

  });

});
