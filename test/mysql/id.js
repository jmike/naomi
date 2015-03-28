var assert = require('chai').assert;
var expression = require('../../src/mysql/query/expression');
var id = require('../../src/mysql/query/expression.id')(expression);
var Database = require('../../src/mysql/Database');
var Table = require('../../src/mysql/Table');

describe('MySQL id expression', function () {

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
