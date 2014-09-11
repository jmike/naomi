require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  querybuilder = require('../src/mysql/querybuilder'),
  assert = chai.assert;

describe('MySQL querybuilder', function () {

  describe('#_where()', function () {

    it('accepts object selector', function () {
      var query = querybuilder._where({
        id: {'=': 1}
      });

      assert.strictEqual(query.sql, 'WHERE `id` = ?');
      assert.lengthOf(query.params, 1);
      assert.strictEqual(query.params[0], 1);
    });

    it('accepts object selector with many properties', function () {
      var query = querybuilder._where({
        age: {'>': 30},
        firstname: {'=': 'James'}
      });

      assert.strictEqual(query.sql, 'WHERE `age` > ? AND `firstname` = ?');
      assert.lengthOf(query.params, 2);
      assert.strictEqual(query.params[0], 30);
      assert.strictEqual(query.params[1], 'James');
    });

    it('accepts Array selector', function () {
      var query = querybuilder._where([
        {
          id: {'>': 2},
          firstname: {'=': 'James'}
        },
        {
          lastname: {'=': 'Bond'}
        }
      ]);

      assert.strictEqual(query.sql, 'WHERE `id` > ? AND `firstname` = ? OR `lastname` = ?');
      assert.lengthOf(query.params, 3);
      assert.strictEqual(query.params[0], 2);
      assert.strictEqual(query.params[1], 'James');
      assert.strictEqual(query.params[2], 'Bond');
    });

    it('handles special "= null" expression', function () {
      var query = querybuilder._where({
        firstname: {'=': null}
      });

      assert.strictEqual(query.sql, 'WHERE `firstname` IS NULL');
      assert.lengthOf(query.params, 0);
    });

    it('handles special "!= null" expression', function () {
      var query = querybuilder._where({
        firstname: {'!=': null}
      });

      assert.strictEqual(query.sql, 'WHERE `firstname` IS NOT NULL');
      assert.lengthOf(query.params, 0);
    });

  });

  describe('#_orderBy()', function () {

    it('accepts object order', function () {
      var sql = querybuilder._orderBy({
        id: 'asc'
      });

      assert.strictEqual(sql, 'ORDER BY `id` ASC');
    });

    it('accepts Array order', function () {
      var sql = querybuilder._orderBy([
        {id: 'asc'},
        {age: 'desc'}
      ]);

      assert.strictEqual(sql, 'ORDER BY `id` ASC, `age` DESC');
    });

  });

  describe('#select()', function () {

    it('returns a valid SQL with table specified', function () {
      var query = querybuilder.select({
        table: 'employees'
      });

      assert.strictEqual(query.sql, 'SELECT * FROM `employees`;');
    });

    it('returns a valid SQL with table + columns specified', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c']
      });

      assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees`;');
    });

    it('returns a valid SQL with table + columns + selector specified', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ]
      });

      assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees` WHERE `a` != ? AND `b` IS NULL;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with table + columns + selector + order specified', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ],
        order: [
          {a: 'asc'},
          {c: 'desc'}
        ]
      });

      assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with table + columns + selector + order + limit specified', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ],
        order: [
          {a: 'asc'},
          {c: 'desc'}
        ],
        limit: 10
      });

      assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC LIMIT 10;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with table + columns + selector + order + limit + offset specified', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ],
        order: [
          {a: 'asc'},
          {c: 'desc'}
        ],
        limit: 10,
        offset: 2
      });

      assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC LIMIT 10 OFFSET 2;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#count()', function () {

    it('returns a valid SQL with table specified', function () {
      var query = querybuilder.count({
        table: 'employees'
      });

      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees`;');
    });

    it('returns a valid SQL with table + columns specified', function () {
      var query = querybuilder.count({
        table: 'employees',
        columns: ['a', 'b', 'c']
      });

      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees`;');
    });

    it('returns a valid SQL with table + columns + selector specified', function () {
      var query = querybuilder.count({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ]
      });

      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `a` != ? AND `b` IS NULL;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with table + columns + selector + limit specified', function () {
      var query = querybuilder.count({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ],
        limit: 10
      });

      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `a` != ? AND `b` IS NULL LIMIT 10;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with table + columns + selector + limit + offset specified', function () {
      var query = querybuilder.count({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ],
        limit: 10,
        offset: 2
      });

      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `a` != ? AND `b` IS NULL LIMIT 10 OFFSET 2;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#delete()', function () {

    it('returns a valid SQL with table specified', function () {
      var query = querybuilder.del({
        table: 'employees'
      });

      assert.strictEqual(query.sql, 'DELETE FROM `employees`;');
    });

    it('returns a valid SQL with selector specified', function () {
      var query = querybuilder.del({
        table: 'employees',
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ]
      });

      assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `a` != ? AND `b` IS NULL;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with table + selector + order specified', function () {
      var query = querybuilder.del({
        table: 'employees',
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ],
        order: [
          {a: 'asc'},
          {c: 'desc'}
        ]
      });

      assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with table + selector + order + limit specified', function () {
      var query = querybuilder.del({
        table: 'employees',
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ],
        order: [
          {a: 'asc'},
          {c: 'desc'}
        ],
        limit: 10
      });

      assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC LIMIT 10;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#upsert()', function () {

    it('returns a valid SQL with table + values + updateColumns specified', function () {
      var query = querybuilder.upsert({
        table: 'employees',
        values: {a: 1, b: 2, c: 3},
        updateColumns: ['b', 'c']
      });

      assert.strictEqual(query.sql, 'INSERT INTO `employees` (`a`, `b`, `c`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `b` = VALUES(`b`), `c` = VALUES(`c`);');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 2);
      assert.strictEqual(query.params[2], 3);
    });

  });

  describe('#insert()', function () {

    it('returns a valid SQL with table + values specified', function () {
      var query = querybuilder.insert({
        table: 'employees',
        values: {a: 1, b: 2, c: 3}
      });

      assert.strictEqual(query.sql, 'INSERT INTO `employees` SET `a` = ?, `b` = ?, `c` = ?;');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 2);
      assert.strictEqual(query.params[2], 3);
    });

  });

});
