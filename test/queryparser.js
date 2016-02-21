/* global describe, it */

import {assert} from 'chai';
import QueryParser from '../src/QueryParser';
import Schema from '../src/Schema';

describe('QueryParser', function() {
  const parser = new QueryParser('employees', new Schema({}));

  describe('parseLimit', function() {
    it('accepts positive integer', function() {
      const ast = parser.parseLimit(1);
      assert.deepEqual(ast, ['LIMIT', 1]);
    });

    it('accepts null limit', function() {
      const ast = parser.parseLimit(null);
      assert.deepEqual(ast, ['LIMIT', null]);
    });

    it('accepts undefined limit', function() {
      const ast = parser.parseLimit();
      assert.deepEqual(ast, ['LIMIT', null]);
    });

    it('throws error when limit is zero (0) or negative', function () {
      assert.throws(() => parser.parseLimit(0), Error);
      assert.throws(() => parser.parseLimit(-1), Error);
      assert.throws(() => parser.parseLimit(-99), Error);
    });

    it('throws error when limit is float', function () {
      assert.throws(() => parser.parseLimit(0.1), Error);
    });
  });

  describe('parseOffset', function() {
    it('accepts positive integer', function() {
      const ast = parser.parseOffset(1);
      assert.deepEqual(ast, ['OFFSET', 1]);
    });

    it('accepts zero (0) offset', function() {
      const ast = parser.parseOffset(0);
      assert.deepEqual(ast, ['OFFSET', 0]);
    });

    it('accepts null offset', function() {
      const ast = parser.parseOffset(null);
      assert.deepEqual(ast, ['OFFSET', null]);
    });

    it('accepts undefined offset', function() {
      const ast = parser.parseOffset();
      assert.deepEqual(ast, ['OFFSET', null]);
    });

    it('throws error when offset is negative', function () {
      assert.throws(() => parser.parseOffset(-1), Error);
      assert.throws(() => parser.parseOffset(-99), Error);
    });

    it('throws error when offset is float', function () {
      assert.throws(() => parser.parseOffset(0.1), Error);
    });
  });

  describe('parseOrderBy', function() {
    it('accepts string as $orderby', function() {
      const ast = parser.parseOrderBy('foo');
      assert.deepEqual(ast, [
        'ORDERBY',
        ['ASC', ['KEY', 'foo']]
      ]);
    });

    it('accepts object as $orderby', function() {
      const ast = parser.parseOrderBy({'foo': -1});
      assert.deepEqual(ast, [
        'ORDERBY',
        ['DESC', ['KEY', 'foo']]
      ]);
    });

    it('accepts array of strings as $orderby', function() {
      const ast = parser.parseOrderBy(['foo', 'bar']);
      assert.deepEqual(ast, [
        'ORDERBY',
        ['ASC', ['KEY', 'foo']],
        ['ASC', ['KEY', 'bar']]
      ]);
    });

    it('accepts array of objects as $orderby', function() {
      const ast = parser.parseOrderBy([{'foo': -1}, {'bar': 1}]);
      assert.deepEqual(ast, [
        'ORDERBY',
        ['DESC', ['KEY', 'foo']],
        ['ASC', ['KEY', 'bar']]
      ]);
    });

    it('accepts array of mixed strings and objects as $orderby', function() {
      const ast = parser.parseOrderBy([{'foo': -1}, 'bar']);
      assert.deepEqual(ast, [
        'ORDERBY',
        ['DESC', ['KEY', 'foo']],
        ['ASC', ['KEY', 'bar']]
      ]);
    });

    it('accepts null as $orderby', function() {
      const ast = parser.parseOrderBy(null);
      assert.deepEqual(ast, ['ORDERBY', null]);
    });

    it('accepts undefined $orderby', function() {
      const ast = parser.parseOrderBy();
      assert.deepEqual(ast, ['ORDERBY', null]);
    });

    it('throws error when $orderby is of invalid type', function () {
      assert.throws(() => parser.parseOrderBy(123), TypeError);
      assert.throws(() => parser.parseOrderBy(true), TypeError);
      assert.throws(() => parser.parseOrderBy(new Date()), TypeError);
      assert.throws(() => parser.parseOrderBy(function () {}), TypeError);
    });

    it('throws error when $orderby array contains invalid values', function () {
      assert.throws(() => parser.parseOrderBy(['foo', 123]), Error);
      assert.throws(() => parser.parseOrderBy(['foo', true]), Error);
      assert.throws(() => parser.parseOrderBy(['foo', new Date()]), Error);
      assert.throws(() => parser.parseOrderBy(['foo', function () {}]), Error);
    });

    it('throws error when $orderby object contains more than one properties', function () {
      assert.throws(() => parser.parseOrderBy({a: -1, b: 1}), Error);
    });

    it('throws error when $orderby object value is not one of -1 or 1', function () {
      assert.throws(() => parser.parseOrderBy({foo: 2}), Error);
      assert.throws(() => parser.parseOrderBy({foo: 0}), Error);
      assert.throws(() => parser.parseOrderBy({foo: -99}), Error);
    });
  });

  describe('parseProjection', function() {
    it('accepts object as $projection', function() {
      const ast = parser.parseProjection({foo: 1, bar: -1});
      assert.deepEqual(ast, [
        'PROJECTION',
        ['INCLUDE', ['KEY', 'foo']],
        ['EXCLUDE', ['KEY', 'bar']]
      ]);
    });

    it('accepts null as $projection', function() {
      const ast = parser.parseProjection(null);
      assert.deepEqual(ast, ['PROJECTION', null]);
    });

    it('accepts undefined $projection', function() {
      const ast = parser.parseProjection();
      assert.deepEqual(ast, ['PROJECTION', null]);
    });

    it('throws error when $projection is of invalid type', function () {
      assert.throws(() => parser.parseProjection(123), TypeError);
      assert.throws(() => parser.parseProjection(true), TypeError);
      assert.throws(() => parser.parseProjection('str'), TypeError);
      assert.throws(() => parser.parseProjection([]), TypeError);
      assert.throws(() => parser.parseProjection(new Date()), TypeError);
      assert.throws(() => parser.parseProjection(function () {}), TypeError);
    });
  });

  describe('parseSelection', function() {
    it('parses plain number', function() {
      const ast = parser.parseSelection(123);
      assert.deepEqual(ast, [
        'SELECTION', [
          'EQ',
          ['ID'],
          ['VALUE', 123]
        ]
      ]);
    });

    it('parses plain string', function() {
      const ast = parser.parseSelection('str');
      assert.deepEqual(ast, [
        'SELECTION', [
          'EQ',
          ['ID'],
          ['VALUE', 'str']
        ]
      ]);
    });

    it('parses plain boolean', function() {
      const ast = parser.parseSelection(true);
      assert.deepEqual(ast, [
        'SELECTION', [
          'EQ',
          ['ID'],
          ['VALUE', true]
        ]
      ]);
    });

    it('parses plain date', function() {
      const d = new Date();
      const ast = parser.parseSelection(d);
      assert.deepEqual(ast, [
        'SELECTION', [
          'EQ',
          ['ID'],
          ['VALUE', d]
        ]
      ]);
    });

    it('parses plain buffer', function() {
      const buf = new Buffer([1, 2, 3]);
      const ast = parser.parseSelection(buf);
      assert.deepEqual(ast, [
        'SELECTION', [
          'EQ',
          ['ID'],
          ['VALUE', buf]
        ]
      ]);
    });

    it('parses array or numbers', function() {
      const ast = parser.parseSelection([1, 2, 3]);
      assert.deepEqual(ast, [
        'SELECTION', [
          'IN',
          ['ID'],
          ['VALUES', 1, 2, 3]
        ]
      ]);
    });

    it('parses object with simple key-value assignment', function() {
      const ast = parser.parseSelection({a: 1});
      assert.deepEqual(ast, [
        'SELECTION', [
          'EQ',
          ['KEY', 'a'],
          ['VALUE', 1]
        ]
      ]);
    });

    it('parses object with multiple key-value assignments', function() {
      const ast = parser.parseSelection({a: 1, b: 2, c: 3});
      assert.deepEqual(ast, [
        'SELECTION', [
          'AND',
          [
            'EQ',
            ['KEY', 'a'],
            ['VALUE', 1]
          ],
          [
            'EQ',
            ['KEY', 'b'],
            ['VALUE', 2]
          ],
          [
            'EQ',
            ['KEY', 'c'],
            ['VALUE', 3]
          ]
        ]
      ]);
    });

    it('parses expression with $eq operator', function() {
      const ast = parser.parseSelection({a: {$eq: 1}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'EQ',
          ['KEY', 'a'],
          ['VALUE', 1]
        ]
      ]);
    });

    it('parses expression with $ne operator', function() {
      const ast = parser.parseSelection({a: {$ne: 1}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'NE',
          ['KEY', 'a'],
          ['VALUE', 1]
        ]
      ]);
    });

    it('parses expression with $lt operator', function() {
      const ast = parser.parseSelection({a: {$lt: 1}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'LT',
          ['KEY', 'a'],
          ['VALUE', 1]
        ]
      ]);
    });

    it('parses expression with $lte operator', function() {
      const ast = parser.parseSelection({a: {$lte: 1}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'LTE',
          ['KEY', 'a'],
          ['VALUE', 1]
        ]
      ]);
    });

    it('parses expression with $gt operator', function() {
      const ast = parser.parseSelection({a: {$gt: 1}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'GT',
          ['KEY', 'a'],
          ['VALUE', 1]
        ]
      ]);
    });

    it('parses expression with $gte operator', function() {
      const ast = parser.parseSelection({a: {$gte: 1}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'GTE',
          ['KEY', 'a'],
          ['VALUE', 1]
        ]
      ]);
    });

    it('parses expression with $in operator', function() {
      const ast = parser.parseSelection({a: {$in: [1, 2, 3]}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'IN',
          ['KEY', 'a'],
          ['VALUES', 1, 2, 3]
        ]
      ]);
    });

    it('parses expression with $nin operator', function() {
      const ast = parser.parseSelection({a: {$nin: [1, 2, 3]}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'NIN',
          ['KEY', 'a'],
          ['VALUES', 1, 2, 3]
        ]
      ]);
    });

    it('parses expression with $like operator', function() {
      const ast = parser.parseSelection({a: {$like: 's%'}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'LIKE',
          ['KEY', 'a'],
          ['VALUE', 's%']
        ]
      ]);
    });

    it('parses expression with $nlike operator', function() {
      const ast = parser.parseSelection({a: {$nlike: 's%'}});
      assert.deepEqual(ast, [
        'SELECTION', [
          'NLIKE',
          ['KEY', 'a'],
          ['VALUE', 's%']
        ]
      ]);
    });

    it('parses expression with $and operator', function() {
      const ast = parser.parseSelection({$and: [{a: 1}, {b: 2}]});
      assert.deepEqual(ast, [
        'SELECTION', [
          'AND',
          [
            'EQ',
            ['KEY', 'a'],
            ['VALUE', 1]
          ],
          [
            'EQ',
            ['KEY', 'b'],
            ['VALUE', 2]
          ]
        ]
      ]);
    });

    it('parses expression with $or operator', function() {
      const ast = parser.parseSelection({$or: [{a: 1}, {a: 2}]});
      assert.deepEqual(ast, [
        'SELECTION', [
          'OR',
          [
            'EQ',
            ['KEY', 'a'],
            ['VALUE', 1]
          ],
          [
            'EQ',
            ['KEY', 'a'],
            ['VALUE', 2]
          ]
        ]
      ]);
    });
  });
});
