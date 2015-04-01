require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  querybuilder = require('../src/postgres/querybuilder'),
  assert = chai.assert;

describe('Postgres querybuilder', function () {

  describe('#where()', function () {

    it('accepts object selector', function () {
      var query = querybuilder.where({
        id: {'=': 1}
      });
      assert.strictEqual(query.sql, '"id" = ?');
      assert.lengthOf(query.params, 1);
      assert.strictEqual(query.params[0], 1);
    });

    it('accepts object selector with many properties', function () {
      var query = querybuilder.where({
        age: {'>': 30},
        firstname: {'=': 'James'}
      });
      assert.strictEqual(query.sql, '"age" > ? AND "firstname" = ?');
      assert.lengthOf(query.params, 2);
      assert.strictEqual(query.params[0], 30);
      assert.strictEqual(query.params[1], 'James');
    });

    it('accepts Array selector', function () {
      var query = querybuilder.where([
        {
          id: {'>': 2},
          firstname: {'=': 'James'}
        },
        {
          lastname: {'=': 'Bond'}
        }
      ]);
      assert.strictEqual(query.sql, '"id" > ? AND "firstname" = ? OR "lastname" = ?');
      assert.lengthOf(query.params, 3);
      assert.strictEqual(query.params[0], 2);
      assert.strictEqual(query.params[1], 'James');
      assert.strictEqual(query.params[2], 'Bond');
    });

    it('handles special "= null" expression', function () {
      var query = querybuilder.where({
        firstname: {'=': null}
      });
      assert.strictEqual(query.sql, '"firstname" IS NULL');
      assert.lengthOf(query.params, 0);
    });

    it('handles special "!= null" expression', function () {
      var query = querybuilder.where({
        firstname: {'!=': null}
      });
      assert.strictEqual(query.sql, '"firstname" IS NOT NULL');
      assert.lengthOf(query.params, 0);
    });

  });

  describe('#orderBy()', function () {

    it('accepts object order', function () {
      var sql = querybuilder.orderBy({
        id: 'asc'
      });
      assert.strictEqual(sql, '"id" ASC');
    });

    it('accepts Array order', function () {
      var sql = querybuilder.orderBy([
        {id: 'asc'},
        {age: 'desc'}
      ]);
      assert.strictEqual(sql, '"id" ASC, "age" DESC');
    });

  });

  describe('#select()', function () {

    it('returns valid SQL with "table" option', function () {
      var query = querybuilder.select({
        table: 'employees'
      });
      assert.strictEqual(query.sql, 'SELECT * FROM "employees";');
    });

    it('returns valid SQL with "table", "columns" options', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c']
      });
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees";');
    });

    it('returns valid SQL with "table", "columns", "selector" options', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: {
          a: {'=': 1}
        }
      });
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" = ?;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns valid SQL with "table", "columns", "selector", "order" options', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: {
          a: {'!=': 1},
          b: {'=': null}
        },
        order: {a: 'asc'},
      });
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns valid SQL with "table", "columns", "selector", "order", "limit" options', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: {
          a: {'!=': 1},
          b: {'=': null}
        },
        order: {a: 'asc'},
        limit: 10
      });
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC LIMIT 10;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns valid SQL with "table", "columns", "selector", "order", "limit", "offset" options', function () {
      var query = querybuilder.select({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: {
          a: {'!=': 1},
          b: {'=': null}
        },
        order: {c: 'desc'},
        limit: 10,
        offset: 2
      });
      assert.strictEqual(query.sql, 'SELECT "a", "b", "c" FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "c" DESC LIMIT 10 OFFSET 2;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#count()', function () {

    it('returns valid SQL with "table" option', function () {
      var query = querybuilder.count({
        table: 'employees'
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees";');
    });

    it('returns valid SQL with "table", "columns" options', function () {
      var query = querybuilder.count({
        table: 'employees',
        columns: ['a', 'b', 'c']
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees";');
    });

    it('returns valid SQL with "table", "columns", "selector" options', function () {
      var query = querybuilder.count({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: {
          a: {'!=': 1},
          b: {'=': null}
        }
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns valid SQL with "table", "columns", "selector", "limit" options', function () {
      var query = querybuilder.count({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: {
          a: {'!=': 1},
          b: {'=': null}
        },
        limit: 10
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL LIMIT 10;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns valid SQL with "table", "columns", "selector", "limit", "offset" options', function () {
      var query = querybuilder.count({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        selector: {
          a: {'!=': 1},
          b: {'=': null}
        },
        limit: 10,
        offset: 2
      });
      assert.strictEqual(query.sql, 'SELECT COUNT(*) AS "count" FROM "employees" WHERE "a" != ? AND "b" IS NULL LIMIT 10 OFFSET 2;');
      assert.strictEqual(query.params[0], 1);
    });

  });

  describe('#del()', function () {

    it('returns a valid SQL with "table" option', function () {
      var query = querybuilder.del({
        table: 'employees'
      });

      assert.strictEqual(query.sql, 'DELETE FROM "employees";');
    });

    it('returns valid SQL with "table", "selector" options', function () {
      var query = querybuilder.del({
        table: 'employees',
        selector: {
          a: {'!=': 1},
          b: {'=': null}
        }
      });

      assert.strictEqual(query.sql, 'DELETE FROM "employees" WHERE "a" != ? AND "b" IS NULL;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns valid SQL with "table", "selector", "order" options', function () {
      var query = querybuilder.del({
        table: 'employees',
        selector: {
          a: {'!=': 1},
          b: {'=': null}
        },
        order: [
          {a: 'asc'},
          {c: 'desc'}
        ]
      });
      assert.strictEqual(query.sql, 'DELETE FROM "employees" WHERE "a" != ? AND "b" IS NULL ORDER BY "a" ASC, "c" DESC;');
      assert.strictEqual(query.params[0], 1);
    });

    it('returns valid SQL with "table", "selector", "order", "limit" options', function () {
      var query = querybuilder.del({
        table: 'employees',
        selector: {
          a: {'!=': 1},
          b: {'=': null}
        },
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

    it('returns valid SQL with "table", "columns", "values", "updateColumns", "identifier" options', function () {
      var query = querybuilder.upsert({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        values: {a: 1, b: 2, c: 3},
        updateColumns: ['b', 'c'],
        identifier: [['a'], ['b']]
      });

      assert.strictEqual(query.sql, 'WITH updated AS (UPDATE "employees" SET "b" = ?, "c" = ? WHERE "a" = ? OR "b" = ? RETURNING *), inserted AS (INSERT INTO "employees" ("a", "b", "c") SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM updated) RETURNING *) SELECT * FROM inserted UNION ALL SELECT * FROM updated;');
      assert.strictEqual(query.params[0], 2);
      assert.strictEqual(query.params[1], 3);
      assert.strictEqual(query.params[2], 1);
      assert.strictEqual(query.params[3], 2);
      assert.strictEqual(query.params[4], 1);
      assert.strictEqual(query.params[5], 2);
      assert.strictEqual(query.params[6], 3);
    });

    it('returns valid SQL with "table", "columns", "values", "updateColumns", "identifier", "returnColumns" options', function () {
      var query = querybuilder.upsert({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        values: {a: 1, b: 2, c: 3},
        updateColumns: ['b', 'c'],
        identifier: [['a'], ['b']],
        returnColumns: ['d']
      });

      assert.strictEqual(query.sql, 'WITH updated AS (UPDATE "employees" SET "b" = ?, "c" = ? WHERE "a" = ? OR "b" = ? RETURNING "d"), inserted AS (INSERT INTO "employees" ("a", "b", "c") SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM updated) RETURNING "d") SELECT * FROM inserted UNION ALL SELECT * FROM updated;');
      assert.strictEqual(query.params[0], 2);
      assert.strictEqual(query.params[1], 3);
      assert.strictEqual(query.params[2], 1);
      assert.strictEqual(query.params[3], 2);
      assert.strictEqual(query.params[4], 1);
      assert.strictEqual(query.params[5], 2);
      assert.strictEqual(query.params[6], 3);
    });

  });

  describe('#insert()', function () {

    it('returns valid SQL with "table", "values", "columns" options', function () {
      var query = querybuilder.insert({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        values: {a: 1, b: 2, c: 3}
      });
      assert.strictEqual(query.sql, 'INSERT INTO "employees" ("a", "b", "c") VALUES (?, ?, ?) RETURNING *;');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 2);
      assert.strictEqual(query.params[2], 3);
    });

    it('returns valid SQL with "table", "values", "columns", "returnColumns" options', function () {
      var query = querybuilder.insert({
        table: 'employees',
        columns: ['a', 'b', 'c'],
        values: {a: 1, b: 2, c: 3},
        returnColumns: ['d', 'e']
      });
      assert.strictEqual(query.sql, 'INSERT INTO "employees" ("a", "b", "c") VALUES (?, ?, ?) RETURNING "d", "e";');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 2);
      assert.strictEqual(query.params[2], 3);
    });

  });

});