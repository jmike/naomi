require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  querybuilder = require('../src/postgres/querybuilder'),
  assert = chai.assert;

describe('postgres-querybuilder', function () {

  describe('#select()', function () {

    it('returns a valid SQL with table specified', function () {
      var query = querybuilder.select({
        table: 'employees'
      });
      assert.strictEqual(query.sql, 'SELECT * FROM "employees";');
    });

    it('returns a valid SQL with table + columns specified', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c']
      });
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees";');
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
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL;');
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
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC;');
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
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC LIMIT 10;');
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
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC LIMIT 10 OFFSET 2;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#count()', function () {

    it('returns a valid SQL with table specified', function () {
      var query = querybuilder.count({
        table: 'employees'
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees";');
    });

    it('returns a valid SQL with table + columns specified', function () {
      var query = querybuilder.count({
        table: 'employees',
        columns: ['a', 'b', 'c']
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees";');
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
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL;');
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
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL LIMIT 10;');
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
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL LIMIT 10 OFFSET 2;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#delete()', function () {

    it('returns a valid SQL with table specified', function () {
      var query = querybuilder.delete({
        table: 'employees'
      });
      assert.strictEqual(query.sql, 'DELETE FROM "employees";');
    });

    it('returns a valid SQL with table + selector specified', function () {
      var query = querybuilder.delete({
        table: 'employees',
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

    it('returns a valid SQL with table + selector + order specified', function () {
      var query = querybuilder.delete({
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
      assert.strictEqual(query.sql, 'DELETE FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns a valid SQL with table + selector + order + limit specified', function () {
      var query = querybuilder.delete({
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
      assert.strictEqual(query.sql, 'DELETE FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC LIMIT 10;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#upsert()', function () {

    it('returns a valid SQL with table + values + updateColumns + updateSelector specified', function () {
      var query = querybuilder.upsert({
        table: 'employees',
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

  describe('#insert()', function () {

    it('returns a valid SQL with table + values specified', function () {
      var query = querybuilder.insert({
        table: 'employees',
        values: {a: 1, b: 2, c: 3}
      });
      assert.strictEqual(query.sql, 'INSERT INTO "employees" SET "a" = ?, "b" = ?, "c" = ?;');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 2);
      assert.strictEqual(query.params[2], 3);
    });

  });

});
