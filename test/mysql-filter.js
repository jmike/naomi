var assert = require('chai').assert;
var Filter = require('../src/mysql/query/Filter');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Filter', function () {

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
      var filter = new Filter();
      assert.deepEqual(filter._v, null);
    });

    it('accepts object $expression', function () {
      var filter = new Filter({id: 1, name: 'Jim'});
      assert.deepEqual(filter._v, {$and: [{id: 1}, {name: 'Jim'}]});
    });

    it('accepts array $expression', function () {
      var filter = new Filter([{id: 1}, {id: 2}]);
      assert.deepEqual(filter._v, {$or: [{id: 1}, {id: 2}]});
    });

    it('accepts number $expression', function () {
      var filter = new Filter(123);
      assert.deepEqual(filter._v, {$primarykey: 123});
    });

    it('accepts string $expression', function () {
      var filter = new Filter('string');
      assert.deepEqual(filter._v, {$primarykey: 'string'});
    });

    it('accepts boolean $expression', function () {
      var filter = new Filter(true);
      assert.deepEqual(filter._v, {$primarykey: true});
    });

    it('accepts date $expression', function () {
      var d = new Date();
      var filter = new Filter(d);
      assert.deepEqual(filter._v, {$primarykey: d});
    });

    it('accepts buffer $expression', function () {
      var buf = new Buffer('abcde');
      var filter = new Filter(buf);
      assert.deepEqual(filter._v, {$primarykey: buf});
    });

    it('ignores $projection, $orderby, $limit, $offset and $values properties in $expression', function () {
      var filter = new Filter({
        $projection: {id: 1, name: -1},
        $orderby: [{id: 1}],
        $limit: 9,
        $offset: 1,
        $values: {id: 1500, name: 'something'}
      });
      assert.deepEqual(filter._v, null);
    });

  });

});
