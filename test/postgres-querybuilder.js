require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  PostgresQueryBuilder = require('../src/PostgresQueryBuilder'),
  assert = chai.assert,
  qb;

qb = new PostgresQueryBuilder('employees');

describe('MySQL QueryBuilder', function () {

  describe('#select()', function () {

    it('returns a valid SQL with no properties specified', function () {
      var query = qb.select();
      assert.strictEqual(query.sql, 'SELECT * FROM "employees";');
    });

    it('returns a valid SQL with columns specified', function () {
      var query = qb.select({
        columns: ['a', 'b', 'c']
      });
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees";');
    });

    it('returns a valid SQL with columns + selector specified', function () {
      var query = qb.select({
        columns: ['a', 'b', 'c'],
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ]
      });
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with columns + selector + order specified', function () {
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
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with columns + selector + order + limit specified', function () {
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
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC LIMIT 10;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with columns + selector + order + limit + offset specified', function () {
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
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC LIMIT 10 OFFSET 2;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#count()', function () {

    it('returns a valid SQL with no properties specified', function () {
      var query = qb.count();
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees";');
    });

    it('returns a valid SQL with columns specified', function () {
      var query = qb.count({
        columns: ['a', 'b', 'c']
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees";');
    });

    it('returns a valid SQL with columns + selector specified', function () {
      var query = qb.count({
        columns: ['a', 'b', 'c'],
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ]
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with columns + selector + order specified', function () {
      var query = qb.count({
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
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with columns + selector + order + limit specified', function () {
      var query = qb.count({
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
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC LIMIT 10;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with columns + selector + order + limit + offset specified', function () {
      var query = qb.count({
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
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC LIMIT 10 OFFSET 2;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#delete()', function () {

    it('returns a valid SQL with no properties specified', function () {
      var query = qb.delete();
      assert.strictEqual(query.sql, 'DELETE FROM "employees";');
    });

    it('returns a valid SQL with selector specified', function () {
      var query = qb.delete({
        selector: [
          {
            a: {'!=': 1},
            b: {'=': null}
          }
        ]
      });
      assert.strictEqual(query.sql, 'DELETE FROM "employees" WHERE "a" != ? AND "b" IS NULL;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with selector + order specified', function () {
      var query = qb.delete({
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
      assert.strictEqual(query.sql, 'DELETE FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with selector + order + limit specified', function () {
      var query = qb.delete({
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
      assert.strictEqual(query.sql, 'DELETE FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC LIMIT 10;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#upsert()', function () {

    it('returns a valid SQL with columns + values + updateColumns + updateSelector specified', function () {
      var query = qb.upsert({
        columns: ['a', 'b', 'c'],
        values: {a: 1, b: 2, c: 3},
        updateColumns: ['b', 'c'],
        updateSelector: [
          {a: {'=': 1}},
          {b: {'!=': null}},
        ]
      });
      assert.strictEqual(query.sql, 'WITH upsert AS (UPDATE "employees" SET "b" = ?, "c" = ? WHERE "a" = ? OR "b" IS NOT NULL RETURNING *) INSERT INTO "employees" ("a", "b", "c") SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM upsert);');
      assert.strictEqual(query.params[0], 2);
      assert.strictEqual(query.params[1], 3);
      assert.strictEqual(query.params[2], 1);
      assert.strictEqual(query.params[3], 1);
      assert.strictEqual(query.params[4], 2);
      assert.strictEqual(query.params[5], 3);
    });

  });

});
