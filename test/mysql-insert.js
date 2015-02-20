var assert = require('chai').assert;
var Insert = require('../src/mysql/query/Insert');
var Database = require('../src/mysql/Database');
var Table = require('../src/mysql/Table');

describe('MySQL Insert', function () {

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
      var insert = new Insert();
      assert.lengthOf(insert._projection._exclude, 0);
      assert.lengthOf(insert._projection._include, 0);
      assert.lengthOf(insert._values._arr, 0);
      assert.strictEqual(insert._ignore, false);
    });

  });

  describe('#toParamSQL()', function () {

    it('returns SQL + params when $query is undefined', function () {
      var insert = new Insert();
      var query = insert.toParamSQL(table);
      assert.strictEqual(query.sql, 'INSERT INTO `employees` VALUES ();');
    });

    it('returns SQL + params when $query is object', function () {
      var insert = new Insert({
        $values: [{name: 'a', age: 10, country: 'FR'}],
        $ignore: true
      });
      var query = insert.toParamSQL(table);
      assert.strictEqual(query.sql, 'INSERT IGNORE INTO `employees` (`name`, `age`, `country`) VALUES (?, ?, ?);');
      assert.lengthOf(query.params, 3);
      assert.strictEqual(query.params[0], 'a');
      assert.strictEqual(query.params[1], 10);
      assert.strictEqual(query.params[2], 'FR');
    });

  });

});
