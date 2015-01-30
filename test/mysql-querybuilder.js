require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var QueryBuilder = require('../src/mysql/QueryBuilder');

describe('MySQL QueryBuilder', function () {

  var querybuilder = new QueryBuilder({
    columns: [
      {name: 'id'},
      {name: 'name'},
      {name: 'age'},
      {name: 'country'}
    ]
  });

  describe('#projection()', function () {

    it('throws error when $projection is Number', function () {
      assert.throws(function () { querybuilder.projection(-1); }, /invalid \$projection argument/i);
      assert.throws(function () { querybuilder.projection(0); }, /invalid \$projection argument/i);
      assert.throws(function () { querybuilder.projection(1); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is Boolean', function () {
      assert.throws(function () { querybuilder.projection(true); }, /invalid \$projection argument/i);
      assert.throws(function () { querybuilder.projection(false); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is String', function () {
      assert.throws(function () { querybuilder.projection(''); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is Array', function () {
      assert.throws(function () { querybuilder.projection([]); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is null', function () {
      assert.throws(function () { querybuilder.projection(null); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection contains an unknown column', function () {
      assert.throws(function () { querybuilder.projection({unknown: 0}); }, /unknown column/i);
    });

    it('accepts empty $projection', function () {
      var query = querybuilder.projection({});
      assert.strictEqual(query.sql, '`id`, `name`, `age`, `country`');
      assert.isArray(query.params);
      assert.lengthOf(query.params, 0);
    });

    it('accepts $projection with inclusive columns', function () {
      var query = querybuilder.projection({name: 1, age: 1});
      assert.strictEqual(query.sql, '`name`, `age`');
      assert.isArray(query.params);
      assert.lengthOf(query.params, 0);
    });

    it('accepts $projection with exclusive columns', function () {
      var query = querybuilder.projection({id: 0});
      assert.strictEqual(query.sql, '`name`, `age`, `country`');
      assert.isArray(query.params);
      assert.lengthOf(query.params, 0);
    });

    it('accepts a mixture of exclusive and inclusive columns, but ignores the exclusive columns', function () {
      var query = querybuilder.projection({id: 0, name: 1, age: 1});
      assert.strictEqual(query.sql, '`name`, `age`');
      assert.isArray(query.params);
      assert.lengthOf(query.params, 0);
    });

  });

  describe('#limit()', function () {

    it('throws error when $limit is Object', function () {
      assert.throws(function () { querybuilder.limit({}); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is Boolean', function () {
      assert.throws(function () { querybuilder.limit(true); }, /invalid \$limit argument/i);
      assert.throws(function () { querybuilder.limit(false); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is String', function () {
      assert.throws(function () { querybuilder.limit(''); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is Array', function () {
      assert.throws(function () { querybuilder.limit([]); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is null', function () {
      assert.throws(function () { querybuilder.limit(null); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is negative integer', function () {
      assert.throws(function () { querybuilder.limit(-1); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is float', function () {
      assert.throws(function () { querybuilder.limit(1.1234); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is zero', function () {
      assert.throws(function () { querybuilder.limit(0); }, /invalid \$limit argument/i);
    });

    it('accepts no $limit', function () {
      var limit = querybuilder.limit();
      assert.strictEqual(limit, null);
    });

    it('accepts positive integer as $limit', function () {
      var limit = querybuilder.limit(10);
      assert.strictEqual(limit, 10);
    });

  });

});

// describe('MySQL querybuilder', function () {

//   describe('#where()', function () {

//     it('accepts object selector', function () {
//       var query = querybuilder.where({
//         id: {'=': 1}
//       });

//       assert.strictEqual(query.sql, '`id` = ?');
//       assert.lengthOf(query.params, 1);
//       assert.strictEqual(query.params[0], 1);
//     });

//     it('accepts object selector with many properties', function () {
//       var query = querybuilder.where({
//         age: {'>': 30},
//         firstname: {'=': 'James'}
//       });

//       assert.strictEqual(query.sql, '`age` > ? AND `firstname` = ?');
//       assert.lengthOf(query.params, 2);
//       assert.strictEqual(query.params[0], 30);
//       assert.strictEqual(query.params[1], 'James');
//     });

//     it('accepts Array selector', function () {
//       var query = querybuilder.where([
//         {
//           id: {'>': 2},
//           firstname: {'=': 'James'}
//         },
//         {
//           lastname: {'=': 'Bond'}
//         }
//       ]);

//       assert.strictEqual(query.sql, '`id` > ? AND `firstname` = ? OR `lastname` = ?');
//       assert.lengthOf(query.params, 3);
//       assert.strictEqual(query.params[0], 2);
//       assert.strictEqual(query.params[1], 'James');
//       assert.strictEqual(query.params[2], 'Bond');
//     });

//     it('handles special "= null" expression', function () {
//       var query = querybuilder.where({
//         firstname: {'=': null}
//       });

//       assert.strictEqual(query.sql, '`firstname` IS NULL');
//       assert.lengthOf(query.params, 0);
//     });

//     it('handles special "!= null" expression', function () {
//       var query = querybuilder.where({
//         firstname: {'!=': null}
//       });

//       assert.strictEqual(query.sql, '`firstname` IS NOT NULL');
//       assert.lengthOf(query.params, 0);
//     });

//   });

//   describe('#orderBy()', function () {

//     it('accepts object order', function () {
//       var sql = querybuilder.orderBy({
//         id: 'asc'
//       });

//       assert.strictEqual(sql, '`id` ASC');
//     });

//     it('accepts Array order', function () {
//       var sql = querybuilder.orderBy([
//         {id: 'asc'},
//         {age: 'desc'}
//       ]);

//       assert.strictEqual(sql, '`id` ASC, `age` DESC');
//     });

//   });

//   describe('#select()', function () {

//     it('returns a valid SQL with table specified', function () {
//       var query = querybuilder.select({
//         table: 'employees'
//       });

//       assert.strictEqual(query.sql, 'SELECT * FROM `employees`;');
//     });

//     it('returns a valid SQL with table + columns specified', function () {
//       var query = querybuilder.select({
//         table: 'employees',
//         columns: ['a', 'b', 'c']
//       });

//       assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees`;');
//     });

//     it('returns a valid SQL with table + columns + selector specified', function () {
//       var query = querybuilder.select({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ]
//       });

//       assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees` WHERE `a` != ? AND `b` IS NULL;');
//       assert.strictEqual(query.params[0], 1);
//     });

//     it('returns a valid SQL with table + columns + selector + order specified', function () {
//       var query = querybuilder.select({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ],
//         order: [
//           {a: 'asc'},
//           {c: 'desc'}
//         ]
//       });

//       assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC;');
//       assert.strictEqual(query.params[0], 1);
//     });

//     it('returns a valid SQL with table + columns + selector + order + limit specified', function () {
//       var query = querybuilder.select({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ],
//         order: [
//           {a: 'asc'},
//           {c: 'desc'}
//         ],
//         limit: 10
//       });

//       assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC LIMIT 10;');
//       assert.strictEqual(query.params[0], 1);
//     });

//     it('returns a valid SQL with table + columns + selector + order + limit + offset specified', function () {
//       var query = querybuilder.select({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ],
//         order: [
//           {a: 'asc'},
//           {c: 'desc'}
//         ],
//         limit: 10,
//         offset: 2
//       });

//       assert.strictEqual(query.sql, 'SELECT `a`, `b`, `c` FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC LIMIT 10 OFFSET 2;');
//       assert.strictEqual(query.params[0], 1);
//     });

//   });

//   describe('#count()', function () {

//     it('returns a valid SQL with table specified', function () {
//       var query = querybuilder.count({
//         table: 'employees'
//       });

//       assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees`;');
//     });

//     it('returns a valid SQL with table + columns specified', function () {
//       var query = querybuilder.count({
//         table: 'employees',
//         columns: ['a', 'b', 'c']
//       });

//       assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees`;');
//     });

//     it('returns a valid SQL with table + columns + selector specified', function () {
//       var query = querybuilder.count({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ]
//       });

//       assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `a` != ? AND `b` IS NULL;');
//       assert.strictEqual(query.params[0], 1);
//     });

//     it('returns a valid SQL with table + columns + selector + limit specified', function () {
//       var query = querybuilder.count({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ],
//         limit: 10
//       });

//       assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `a` != ? AND `b` IS NULL LIMIT 10;');
//       assert.strictEqual(query.params[0], 1);
//     });

//     it('returns a valid SQL with table + columns + selector + limit + offset specified', function () {
//       var query = querybuilder.count({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ],
//         limit: 10,
//         offset: 2
//       });

//       assert.strictEqual(query.sql, 'SELECT COUNT(*) AS `count` FROM `employees` WHERE `a` != ? AND `b` IS NULL LIMIT 10 OFFSET 2;');
//       assert.strictEqual(query.params[0], 1);
//     });

//   });

//   describe('#delete()', function () {

//     it('returns a valid SQL with table specified', function () {
//       var query = querybuilder.del({
//         table: 'employees'
//       });

//       assert.strictEqual(query.sql, 'DELETE FROM `employees`;');
//     });

//     it('returns a valid SQL with selector specified', function () {
//       var query = querybuilder.del({
//         table: 'employees',
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ]
//       });

//       assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `a` != ? AND `b` IS NULL;');
//       assert.strictEqual(query.params[0], 1);
//     });

//     it('returns a valid SQL with table + selector + order specified', function () {
//       var query = querybuilder.del({
//         table: 'employees',
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ],
//         order: [
//           {a: 'asc'},
//           {c: 'desc'}
//         ]
//       });

//       assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC;');
//       assert.strictEqual(query.params[0], 1);
//     });

//     it('returns a valid SQL with table + selector + order + limit specified', function () {
//       var query = querybuilder.del({
//         table: 'employees',
//         selector: [
//           {
//             a: {'!=': 1},
//             b: {'=': null}
//           }
//         ],
//         order: [
//           {a: 'asc'},
//           {c: 'desc'}
//         ],
//         limit: 10
//       });

//       assert.strictEqual(query.sql, 'DELETE FROM `employees` WHERE `a` != ? AND `b` IS NULL ORDER BY `a` ASC, `c` DESC LIMIT 10;');
//       assert.strictEqual(query.params[0], 1);
//     });

//   });

//   describe('#upsert()', function () {

//     it('returns a valid SQL with table + values + updateColumns specified', function () {
//       var query = querybuilder.upsert({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         values: {a: 1, b: 2, c: 3},
//         updateColumns: ['b', 'c']
//       });

//       assert.strictEqual(query.sql, 'INSERT INTO `employees` (`a`, `b`, `c`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `b` = VALUES(`b`), `c` = VALUES(`c`);');
//       assert.strictEqual(query.params[0], 1);
//       assert.strictEqual(query.params[1], 2);
//       assert.strictEqual(query.params[2], 3);
//     });

//   });

//   describe('#insert()', function () {

//     it('returns a valid SQL with table + columns + values specified', function () {
//       var query = querybuilder.insert({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         values: {a: 1, b: 2, c: 3}
//       });

//       assert.strictEqual(query.sql, 'INSERT INTO `employees` (`a`, `b`, `c`) VALUES (?, ?, ?);');
//       assert.strictEqual(query.params[0], 1);
//       assert.strictEqual(query.params[1], 2);
//       assert.strictEqual(query.params[2], 3);
//     });

//     it('accepts array of values specified', function () {
//       var query = querybuilder.insert({
//         table: 'employees',
//         columns: ['a', 'b', 'c'],
//         values: [{a: 1, b: 2, c: 3}, {a: 4, b: 5, c: 6, d: 'invalid'}]
//       });

//       assert.strictEqual(query.sql, 'INSERT INTO `employees` (`a`, `b`, `c`) VALUES (?, ?, ?), (?, ?, ?);');
//       assert.strictEqual(query.params[0], 1);
//       assert.strictEqual(query.params[1], 2);
//       assert.strictEqual(query.params[2], 3);
//       assert.strictEqual(query.params[3], 4);
//       assert.strictEqual(query.params[4], 5);
//       assert.strictEqual(query.params[5], 6);
//     });

//   });

// });
