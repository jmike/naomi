var assert = require('chai').assert;
var upsert = require('../src/mysql/query/upsert');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL upsert', function () {

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
    var result = upsert(undefined, table);
    assert.strictEqual(result.sql, 'INSERT IGNORE INTO `employees` VALUES ();');
    assert.lengthOf(result.params, 0);
  });

  it('accepts object $query', function () {
    var result = upsert({
      $values: [{id: 2, name: 'a', age: 10, country: 'FR'}]
    }, table);
    assert.strictEqual(result.sql, 'INSERT INTO `employees` (`id`, `name`, `age`, `country`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `age` = VALUES(`age`), `country` = VALUES(`country`);');
    assert.lengthOf(result.params, 4);
    assert.strictEqual(result.params[0], 2);
    assert.strictEqual(result.params[1], 'a');
    assert.strictEqual(result.params[2], 10);
    assert.strictEqual(result.params[3], 'FR');
  });

  it('accepts object $query with $updateColumns', function () {
    var result = upsert({
      $values: [{id: 2, name: 'a', age: 10, country: 'FR'}],
      $updateColumns: ['country', 'age']
    }, table);
    assert.strictEqual(result.sql, 'INSERT INTO `employees` (`id`, `name`, `age`, `country`) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE `country` = VALUES(`country`), `age` = VALUES(`age`);');
    assert.lengthOf(result.params, 4);
    assert.strictEqual(result.params[0], 2);
    assert.strictEqual(result.params[1], 'a');
    assert.strictEqual(result.params[2], 10);
    assert.strictEqual(result.params[3], 'FR');
  });

});
