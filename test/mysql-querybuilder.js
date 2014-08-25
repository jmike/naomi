require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  qb = require('../src/MySQLQueryBuilder'),
  assert = chai.assert;

describe('MySQL QueryBuilder', function () {

  describe('#select()', function () {

    it('returns a valid SQL with table specified', function () {
      var query = qb.select({
        table: 'employees'
      });
      assert.strictEqual(query.sql, 'SELECT * FROM `employees`;');
    });

    it('returns a valid SQL with table + columns specified', function () {
      var query = qb.select({
        table: 'employees',
        columns: ['a', 'b', 'c']
      });
      assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees`;');
    });

    it('returns a valid SQL with table + columns + selector specified', function () {
      var query = qb.select({
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
      var query = qb.select({
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
      var query = qb.select({
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
      var query = qb.select({
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
      var query = qb.count({
        table: 'employees'
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees`;');
    });

    it('returns a valid SQL with table + columns specified', function () {
      var query = qb.count({
        table: 'employees',
        columns: ['a', 'b', 'c']
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees`;');
    });

    it('returns a valid SQL with table + columns + selector specified', function () {
      var query = qb.count({
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
      var query = qb.count({
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
      var query = qb.count({
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
      var query = qb.delete({
        table: 'employees'
      });
      assert.strictEqual(query.sql, 'DELETE FROM `employees`;');
    });

    it('returns a valid SQL with selector specified', function () {
      var query = qb.delete({
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
      var query = qb.delete({
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
      var query = qb.delete({
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
      var query = qb.upsert({
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
      var query = qb.insert({
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
