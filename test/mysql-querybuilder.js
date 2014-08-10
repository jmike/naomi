require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  MySQLQueryBuilder = require('../src/MySQLQueryBuilder'),
  assert = chai.assert,
  qb;

qb = new MySQLQueryBuilder('employees');

describe('MySQL QueryBuilder', function () {

  describe('#select()', function () {

    it('returns a valid SQL with no properties specified', function () {
      var query = qb.select();
      assert.strictEqual(query.sql, 'SELECT * FROM `employees`;');
    });

    it('returns a valid SQL with columns specified', function () {
      var query = qb.select({
        columns: ['a', 'b', 'c']
      });
      assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees`;');
    });

    it('returns a valid SQL with no columns + selector specified', function () {
      var query = qb.select({
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

    it('returns a valid SQL with no columns + selector + order specified', function () {
      var query = qb.select({
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

    it('returns a valid SQL with no columns + selector + order + limit specified', function () {
      var query = qb.select({
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

    it('returns a valid SQL with no columns + selector + order + limit + offset specified', function () {
      var query = qb.select({
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

});
