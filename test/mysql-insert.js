var assert = require('chai').assert;
var insert = require('../src/mysql/query/insert');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL insert', function () {

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
    var result = insert(undefined, table);
    assert.strictEqual(result.sql, 'INSERT INTO `employees` VALUES ();');
    assert.lengthOf(result.params, 0);
  });

  it('accepts object $query', function () {
    var result = insert({
      $values: [{name: 'a', age: 10, country: 'FR'}],
      $ignore: true
    }, table);
    assert.strictEqual(result.sql, 'INSERT IGNORE INTO `employees` (`name`, `age`, `country`) VALUES (?, ?, ?);');
    assert.lengthOf(result.params, 3);
    assert.strictEqual(result.params[0], 'a');
    assert.strictEqual(result.params[1], 10);
    assert.strictEqual(result.params[2], 'FR');
  });

});
