var assert = require('chai').assert;
var expression = require('../../src/postgres/query/expression');
var id = require('../../src/postgres/query/expression.id')(expression);
var Database = require('../../src/postgres/Database');
var Table = require('../../src/postgres/Table');

describe('Postgres id expression', function () {

  var db = new Database({database: 'something'});

  var table = new Table(db, 'employees');
  table.columns = [
    {name: 'id'},
    {name: 'name'},
    {name: 'age'},
    {name: 'country'}
  ];
  table.primaryKey = ['id'];

  it('throws error when $id is Array', function () {
    assert.throws(function () { id([], table); }, /invalid \$id expression/i);
  });

  it('accepts null values', function () {
    assert.doesNotThrow(function () { id(null, table); });
  });

});
