var assert = require('chai').assert;
var filter = require('../../src/postgres/query/filter');
var Database = require('../../src/postgres/Database');
var Table = require('../../src/postgres/Table');

describe('Postgres filter', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('accepts undefined $query', function () {
    var query = filter(undefined, table);
    assert.strictEqual(query.sql, '');
    assert.lengthOf(query.params, 0);
  });

  it('accepts object $query', function () {
    var query = filter({id: 1, name: 'Jim'}, table);
    assert.strictEqual(query.sql, '("id" = ? AND "name" = ?)');
    assert.lengthOf(query.params, 2);
  });

  it('accepts array $query', function () {
    var query = filter([{id: 1}, 2], table);
    assert.strictEqual(query.sql, '("id" = ? OR "id" = ?)');
    assert.lengthOf(query.params, 2);
  });

  it('accepts number $query', function () {
    var query = filter(123, table);
    assert.strictEqual(query.sql, '"id" = ?');
    assert.lengthOf(query.params, 1);
  });

  it('accepts string $query', function () {
    var query = filter('string', table);
    assert.strictEqual(query.sql, '"id" = ?');
    assert.lengthOf(query.params, 1);
  });

  it('accepts boolean $query', function () {
    var query = filter(true, table);
    assert.strictEqual(query.sql, '"id" = ?');
    assert.lengthOf(query.params, 1);
  });

  it('accepts date $query', function () {
    var d = new Date();
    var query = filter(d, table);
    assert.strictEqual(query.sql, '"id" = ?');
    assert.lengthOf(query.params, 1);
  });

  it('accepts buffer $query', function () {
    var buf = new Buffer('abcde');
    var query = filter(buf, table);
    assert.strictEqual(query.sql, '"id" = ?');
    assert.lengthOf(query.params, 1);
  });

  it('ignores $projection, $orderby, $limit, $offset and $values properties in $query', function () {
    var query = filter({
      $projection: {id: 1, name: -1},
      $orderby: [{id: 1}],
      $limit: 9,
      $offset: 1,
      $values: {id: 1500, name: 'something'}
    }, table);
    assert.strictEqual(query.sql, '');
    assert.lengthOf(query.params, 0);
  });

});
