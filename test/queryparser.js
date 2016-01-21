/* global describe, it */

import {assert} from 'chai';
import QueryParser from '../src/QueryParser';

describe('QueryParser', function() {
  describe('#parse()', function() {
    it('accepts positive integer as $limit', function() {
      const ast = QueryParser.parse({$limit: 1});
      console.log(123, ast);
      assert.deepEqual(ast.limit, ['LIMIT', 1]);
    });

    it('accepts null as $limit', function() {
      const ast = QueryParser.parse({$limit: null});
      assert.deepEqual(ast.limit, ['LIMIT', null]);
    });

    it('accepts undefined $limit', function() {
      const ast = QueryParser.parse({});
      assert.deepEqual(ast.limit, ['LIMIT', null]);
    });

    it('throws error when $limit is zero (0) or negative', function () {
      assert.throws(() => QueryParser.parse({$limit: 0}), Error);
      assert.throws(() => QueryParser.parse({$limit: -1}), Error);
      assert.throws(() => QueryParser.parse({$limit: -99}), Error);
    });

    it('throws error when $limit is float', function () {
      assert.throws(() => QueryParser.parse({$limit: 0.1}), Error);
    });
  });

  describe('#parseOffset()', function() {
    it('accepts positive integer as $offset', function() {
      const ast = QueryParser.parse({$offset: 1});
      assert.deepEqual(ast.offset, ['OFFSET', 1]);
    });

    it('accepts zero (0) as $offset', function() {
      const ast = QueryParser.parse({$offset: 0});
      assert.deepEqual(ast.offset, ['OFFSET', 0]);
    });

    it('accepts null as $offset', function() {
      const ast = QueryParser.parse({$offset: null});
      assert.deepEqual(ast.offset, ['OFFSET', null]);
    });

    it('accepts undefined $offset', function() {
      const ast = QueryParser.parse({});
      assert.deepEqual(ast.offset, ['OFFSET', null]);
    });

    it('throws error when $offset is negative', function () {
      assert.throws(() => QueryParser.parse({$offset: -1}), Error);
      assert.throws(() => QueryParser.parse({$offset: -99}), Error);
    });

    it('throws error when $limit is float', function () {
      assert.throws(() => QueryParser.parse({$offset: 0.1}), Error);
    });
  });

  // describe('#parseOrderBy()', function() {
  //   it('accepts string as $orderby', function() {
  //     const ast = QueryParser.parseOrderBy('foo');
  //     assert.deepEqual(ast, [
  //       'ORDERBY',
  //       ['ASC', ['KEY', 'foo']]
  //     ]);
  //   });

  //   it('accepts object as $orderby', function() {
  //     const ast = QueryParser.parseOrderBy({'foo': -1});
  //     assert.deepEqual(ast, [
  //       'ORDERBY',
  //       ['DESC', ['KEY', 'foo']]
  //     ]);
  //   });

  //   it('accepts array of strings as $orderby', function() {
  //     const ast = QueryParser.parseOrderBy(['foo', 'bar']);
  //     assert.deepEqual(ast, [
  //       'ORDERBY',
  //       ['ASC', ['KEY', 'foo']],
  //       ['ASC', ['KEY', 'bar']]
  //     ]);
  //   });

  //   it('accepts array of objects as $orderby', function() {
  //     const ast = QueryParser.parseOrderBy([{'foo': -1}, {'bar': 1}]);
  //     assert.deepEqual(ast, [
  //       'ORDERBY',
  //       ['DESC', ['KEY', 'foo']],
  //       ['ASC', ['KEY', 'bar']]
  //     ]);
  //   });

  //   it('accepts array of mixed strings and objects as $orderby', function() {
  //     const ast = QueryParser.parseOrderBy([{'foo': -1}, 'bar']);
  //     assert.deepEqual(ast, [
  //       'ORDERBY',
  //       ['DESC', ['KEY', 'foo']],
  //       ['ASC', ['KEY', 'bar']]
  //     ]);
  //   });

  //   it('accepts null as $orderby', function() {
  //     const ast = QueryParser.parseOrderBy(null);
  //     assert.deepEqual(ast, ['ORDERBY', null]);
  //   });

  //   it('accepts undefined $orderby', function() {
  //     const ast = QueryParser.parseOrderBy();
  //     assert.deepEqual(ast, ['ORDERBY', null]);
  //   });

  //   it('throws error when $orderby is of invalid type', function () {
  //     assert.throws(() => QueryParser.parseOrderBy(123), Error);
  //     assert.throws(() => QueryParser.parseOrderBy(true), Error);
  //     assert.throws(() => QueryParser.parseOrderBy(new Date()), Error);
  //     assert.throws(() => QueryParser.parseOrderBy(function () {}), Error);
  //   });

  //   it('throws error when $orderby array contains invalid values', function () {
  //     assert.throws(() => QueryParser.parseOrderBy(['foo', 123]), Error);
  //     assert.throws(() => QueryParser.parseOrderBy(['foo', true]), Error);
  //     assert.throws(() => QueryParser.parseOrderBy(['foo', new Date()]), Error);
  //     assert.throws(() => QueryParser.parseOrderBy(['foo', function () {}]), Error);
  //   });

  //   it('throws error when $orderby object contains more than one properties', function () {
  //     assert.throws(() => QueryParser.parseOrderBy({a: -1, b: 1}), Error);
  //   });

  //   it('throws error when $orderby object value is not one of -1, 1', function () {
  //     assert.throws(() => QueryParser.parseOrderBy({foo: 2}), Error);
  //     assert.throws(() => QueryParser.parseOrderBy({foo: 0}), Error);
  //     assert.throws(() => QueryParser.parseOrderBy({foo: -99}), Error);
  //   });
  // });

  // describe('#parseProjection()', function() {
  //   it('accepts object as $projection', function() {
  //     const ast = QueryParser.parseProjection({foo: 1, bar: -1});
  //     assert.deepEqual(ast, [
  //       'PROJECTION',
  //       ['INCLUDE', ['KEY', 'foo']],
  //       ['EXCLUDE', ['KEY', 'bar']]
  //     ]);
  //   });

  //   it('accepts null as $projection', function() {
  //     const ast = QueryParser.parseProjection(null);
  //     assert.deepEqual(ast, ['PROJECTION', null]);
  //   });

  //   it('accepts undefined $projection', function() {
  //     const ast = QueryParser.parseProjection();
  //     assert.deepEqual(ast, ['PROJECTION', null]);
  //   });

  //   it('throws error when $projection is of invalid type', function () {
  //     assert.throws(() => QueryParser.parseProjection(123), TypeError);
  //     assert.throws(() => QueryParser.parseProjection(true), TypeError);
  //     assert.throws(() => QueryParser.parseProjection('str'), TypeError);
  //     assert.throws(() => QueryParser.parseProjection([]), TypeError);
  //     assert.throws(() => QueryParser.parseProjection(new Date()), TypeError);
  //     assert.throws(() => QueryParser.parseProjection(function () {}), TypeError);
  //   });
  // });

  // describe('#parseSelection()', function() {
  //   it('parses plain number', function() {
  //     const ast = QueryParser.parseSelection(123);
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'EQ',
  //         ['ID'],
  //         ['VALUE', 123]
  //       ]
  //     ]);
  //   });

  //   it('parses plain string', function() {
  //     const ast = QueryParser.parseSelection('str');
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'EQ',
  //         ['ID'],
  //         ['VALUE', 'str']
  //       ]
  //     ]);
  //   });

  //   it('parses plain boolean', function() {
  //     const ast = QueryParser.parseSelection(true);
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'EQ',
  //         ['ID'],
  //         ['VALUE', true]
  //       ]
  //     ]);
  //   });

  //   it('parses plain date', function() {
  //     const d = new Date();
  //     const ast = QueryParser.parseSelection(d);
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'EQ',
  //         ['ID'],
  //         ['VALUE', d]
  //       ]
  //     ]);
  //   });

  //   it('parses plain buffer', function() {
  //     const buf = new Buffer([1, 2, 3]);
  //     const ast = QueryParser.parseSelection(buf);
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'EQ',
  //         ['ID'],
  //         ['VALUE', buf]
  //       ]
  //     ]);
  //   });

  //   it('parses array or numbers', function() {
  //     const ast = QueryParser.parseSelection([1, 2, 3]);
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'IN',
  //         ['ID'],
  //         ['VALUES', 1, 2, 3]
  //       ]
  //     ]);
  //   });

  //   it('parses object with simple key-value assignment', function() {
  //     const ast = QueryParser.parseSelection({a: 1});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'EQ',
  //         ['KEY', 'a'],
  //         ['VALUE', 1]
  //       ]
  //     ]);
  //   });

  //   it('parses object with multiple key-value assignments', function() {
  //     const ast = QueryParser.parseSelection({a: 1, b: 2, c: 3});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'AND',
  //         [
  //           'EQ',
  //           ['KEY', 'a'],
  //           ['VALUE', 1]
  //         ],
  //         [
  //           'EQ',
  //           ['KEY', 'b'],
  //           ['VALUE', 2]
  //         ],
  //         [
  //           'EQ',
  //           ['KEY', 'c'],
  //           ['VALUE', 3]
  //         ]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $eq operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$eq: 1}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'EQ',
  //         ['KEY', 'a'],
  //         ['VALUE', 1]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $ne operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$ne: 1}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'NE',
  //         ['KEY', 'a'],
  //         ['VALUE', 1]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $lt operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$lt: 1}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'LT',
  //         ['KEY', 'a'],
  //         ['VALUE', 1]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $lte operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$lte: 1}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'LTE',
  //         ['KEY', 'a'],
  //         ['VALUE', 1]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $gt operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$gt: 1}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'GT',
  //         ['KEY', 'a'],
  //         ['VALUE', 1]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $gte operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$gte: 1}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'GTE',
  //         ['KEY', 'a'],
  //         ['VALUE', 1]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $in operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$in: [1, 2, 3]}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'IN',
  //         ['KEY', 'a'],
  //         ['VALUES', 1, 2, 3]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $nin operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$nin: [1, 2, 3]}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'NIN',
  //         ['KEY', 'a'],
  //         ['VALUES', 1, 2, 3]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $like operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$like: 's%'}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'LIKE',
  //         ['KEY', 'a'],
  //         ['VALUE', 's%']
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $nlike operator', function() {
  //     const ast = QueryParser.parseSelection({a: {$nlike: 's%'}});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'NLIKE',
  //         ['KEY', 'a'],
  //         ['VALUE', 's%']
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $and operator', function() {
  //     const ast = QueryParser.parseSelection({$and: [{a: 1}, {b: 2}]});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'AND',
  //         [
  //           'EQ',
  //           ['KEY', 'a'],
  //           ['VALUE', 1]
  //         ],
  //         [
  //           'EQ',
  //           ['KEY', 'b'],
  //           ['VALUE', 2]
  //         ]
  //       ]
  //     ]);
  //   });

  //   it('parses expression with $or operator', function() {
  //     const ast = QueryParser.parseSelection({$or: [{a: 1}, {a: 2}]});
  //     assert.deepEqual(ast, [
  //       'SELECTION', [
  //         'OR',
  //         [
  //           'EQ',
  //           ['KEY', 'a'],
  //           ['VALUE', 1]
  //         ],
  //         [
  //           'EQ',
  //           ['KEY', 'a'],
  //           ['VALUE', 2]
  //         ]
  //       ]
  //     ]);
  //   });
  // });
});
