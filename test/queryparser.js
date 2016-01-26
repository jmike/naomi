/* global describe, it */

import {assert} from 'chai';
import QueryParser from '../src/QueryParser';

describe('QueryParser', function() {
  // limit

  it('accepts positive integer as $limit', function() {
    const ast = QueryParser.parse({$limit: 1});
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

  // offset

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

  it('throws error when $offset is float', function () {
    assert.throws(() => QueryParser.parse({$offset: 0.1}), Error);
  });

  // orderby

  it('accepts string as $orderby', function() {
    const ast = QueryParser.parse({$orderby: 'foo'});
    assert.deepEqual(ast.orderby, [
      'ORDERBY',
      ['ASC', ['KEY', 'foo']]
    ]);
  });

  it('accepts object as $orderby', function() {
    const ast = QueryParser.parse({$orderby: {'foo': -1}});
    assert.deepEqual(ast.orderby, [
      'ORDERBY',
      ['DESC', ['KEY', 'foo']]
    ]);
  });

  it('accepts array of strings as $orderby', function() {
    const ast = QueryParser.parse({$orderby: ['foo', 'bar']});
    assert.deepEqual(ast.orderby, [
      'ORDERBY',
      ['ASC', ['KEY', 'foo']],
      ['ASC', ['KEY', 'bar']]
    ]);
  });

  it('accepts array of objects as $orderby', function() {
    const ast = QueryParser.parse({$orderby: [{'foo': -1}, {'bar': 1}]});
    assert.deepEqual(ast.orderby, [
      'ORDERBY',
      ['DESC', ['KEY', 'foo']],
      ['ASC', ['KEY', 'bar']]
    ]);
  });

  it('accepts array of mixed strings and objects as $orderby', function() {
    const ast = QueryParser.parse({$orderby: [{'foo': -1}, 'bar']});
    assert.deepEqual(ast.orderby, [
      'ORDERBY',
      ['DESC', ['KEY', 'foo']],
      ['ASC', ['KEY', 'bar']]
    ]);
  });

  it('accepts null as $orderby', function() {
    const ast = QueryParser.parse({$orderby: null});
    assert.deepEqual(ast.orderby, ['ORDERBY', null]);
  });

  it('accepts undefined $orderby', function() {
    const ast = QueryParser.parse({});
    assert.deepEqual(ast.orderby, ['ORDERBY', null]);
  });

  it('throws error when $orderby is of invalid type', function () {
    assert.throws(() => QueryParser.parse({$orderby: 123}), TypeError);
    assert.throws(() => QueryParser.parse({$orderby: true}), TypeError);
    assert.throws(() => QueryParser.parse({$orderby: new Date()}), TypeError);
    assert.throws(() => QueryParser.parse({$orderby: function () {}}), TypeError);
  });

  it('throws error when $orderby array contains invalid values', function () {
    assert.throws(() => QueryParser.parse({$orderby: ['foo', 123]}), Error);
    assert.throws(() => QueryParser.parse({$orderby: ['foo', true]}), Error);
    assert.throws(() => QueryParser.parse({$orderby: ['foo', new Date()]}), Error);
    assert.throws(() => QueryParser.parse({$orderby: ['foo', function () {}]}), Error);
  });

  it('throws error when $orderby object contains more than one properties', function () {
    assert.throws(() => QueryParser.parse({$orderby: {a: -1, b: 1}}), Error);
  });

  it('throws error when $orderby object value is not one of -1, 1', function () {
    assert.throws(() => QueryParser.parse({$orderby: {foo: 2}}), Error);
    assert.throws(() => QueryParser.parse({$orderby: {foo: 0}}), Error);
    assert.throws(() => QueryParser.parse({$orderby: {foo: -99}}), Error);
  });

  // projection

  it('accepts object as $projection', function() {
    const ast = QueryParser.parse({$projection: {foo: 1, bar: -1}});
    assert.deepEqual(ast.projection, [
      'PROJECTION',
      ['INCLUDE', ['KEY', 'foo']],
      ['EXCLUDE', ['KEY', 'bar']]
    ]);
  });

  it('accepts null as $projection', function() {
    const ast = QueryParser.parse({$projection: null});
    assert.deepEqual(ast.projection, ['PROJECTION', null]);
  });

  it('accepts undefined $projection', function() {
    const ast = QueryParser.parse({});
    assert.deepEqual(ast.projection, ['PROJECTION', null]);
  });

  it('throws error when $projection is of invalid type', function () {
    assert.throws(() => QueryParser.parse({$projection: 123}), TypeError);
    assert.throws(() => QueryParser.parse({$projection: true}), TypeError);
    assert.throws(() => QueryParser.parse({$projection: 'str'}), TypeError);
    assert.throws(() => QueryParser.parse({$projection: []}), TypeError);
    assert.throws(() => QueryParser.parse({$projection: new Date()}), TypeError);
    assert.throws(() => QueryParser.parse({$projection: function () {}}), TypeError);
  });

  // selection

  it('parses plain number', function() {
    const ast = QueryParser.parse(123);
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', 123]
      ]
    ]);
  });

  it('parses plain string', function() {
    const ast = QueryParser.parse('str');
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', 'str']
      ]
    ]);
  });

  it('parses plain boolean', function() {
    const ast = QueryParser.parse(true);
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', true]
      ]
    ]);
  });

  it('parses plain date', function() {
    const d = new Date();
    const ast = QueryParser.parse(d);
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', d]
      ]
    ]);
  });

  it('parses plain buffer', function() {
    const buf = new Buffer([1, 2, 3]);
    const ast = QueryParser.parse(buf);
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', buf]
      ]
    ]);
  });

  it('parses array or numbers', function() {
    const ast = QueryParser.parse([1, 2, 3]);
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'IN',
        ['ID'],
        ['VALUES', 1, 2, 3]
      ]
    ]);
  });

  it('parses object with simple key-value assignment', function() {
    const ast = QueryParser.parse({a: 1});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'EQ',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses object with multiple key-value assignments', function() {
    const ast = QueryParser.parse({a: 1, b: 2, c: 3});
    assert.deepEqual(ast.selection, [
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
    const ast = QueryParser.parse({a: {$eq: 1}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'EQ',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $ne operator', function() {
    const ast = QueryParser.parse({a: {$ne: 1}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'NE',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $lt operator', function() {
    const ast = QueryParser.parse({a: {$lt: 1}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'LT',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $lte operator', function() {
    const ast = QueryParser.parse({a: {$lte: 1}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'LTE',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $gt operator', function() {
    const ast = QueryParser.parse({a: {$gt: 1}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'GT',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $gte operator', function() {
    const ast = QueryParser.parse({a: {$gte: 1}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'GTE',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $in operator', function() {
    const ast = QueryParser.parse({a: {$in: [1, 2, 3]}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'IN',
        ['KEY', 'a'],
        ['VALUES', 1, 2, 3]
      ]
    ]);
  });

  it('parses expression with $nin operator', function() {
    const ast = QueryParser.parse({a: {$nin: [1, 2, 3]}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'NIN',
        ['KEY', 'a'],
        ['VALUES', 1, 2, 3]
      ]
    ]);
  });

  it('parses expression with $like operator', function() {
    const ast = QueryParser.parse({a: {$like: 's%'}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'LIKE',
        ['KEY', 'a'],
        ['VALUE', 's%']
      ]
    ]);
  });

  it('parses expression with $nlike operator', function() {
    const ast = QueryParser.parse({a: {$nlike: 's%'}});
    assert.deepEqual(ast.selection, [
      'SELECTION', [
        'NLIKE',
        ['KEY', 'a'],
        ['VALUE', 's%']
      ]
    ]);
  });

  it('parses expression with $and operator', function() {
    const ast = QueryParser.parse({$and: [{a: 1}, {b: 2}]});
    assert.deepEqual(ast.selection, [
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
    const ast = QueryParser.parse({$or: [{a: 1}, {a: 2}]});
    assert.deepEqual(ast.selection, [
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
