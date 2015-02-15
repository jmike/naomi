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

    it('accepts undefined $query', function () {
      var filter = new Filter();
      assert.deepEqual(filter._v, null);
    });

    it('accepts object $query', function () {
      var filter = new Filter({id: 1, name: 'Jim'});
      assert.deepEqual(filter._v, {$and: [{id: 1}, {name: 'Jim'}]});
    });

    it('accepts array $query', function () {
      var filter = new Filter([{id: 1}, {id: 2}]);
      assert.deepEqual(filter._v, {$or: [{id: 1}, {id: 2}]});
    });

    it('accepts number $query', function () {
      var filter = new Filter(123);
      assert.deepEqual(filter._v, {$id: 123});
    });

    it('accepts string $query', function () {
      var filter = new Filter('string');
      assert.deepEqual(filter._v, {$id: 'string'});
    });

    it('accepts boolean $query', function () {
      var filter = new Filter(true);
      assert.deepEqual(filter._v, {$id: true});
    });

    it('accepts date $query', function () {
      var d = new Date();
      var filter = new Filter(d);
      assert.deepEqual(filter._v, {$id: d});
    });

    it('accepts buffer $query', function () {
      var buf = new Buffer('abcde');
      var filter = new Filter(buf);
      assert.deepEqual(filter._v, {$id: buf});
    });

    it('ignores $projection, $orderby, $limit, $offset and $values properties in $query', function () {
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
