/* global describe, it */

const {assert} = require('chai');
const QueryParser = require('../src/QueryParser');

// register basic operators
require('../src/operators/and');
require('../src/operators/or');
require('../src/operators/eq');
require('../src/operators/ne');
require('../src/operators/gt');
require('../src/operators/gte');
require('../src/operators/lt');
require('../src/operators/lte');
require('../src/operators/like');
require('../src/operators/nlike');
require('../src/operators/in');
require('../src/operators/nin');

describe('QueryParser', function() {
  it('parses plain number', function() {
    const ast = QueryParser.parse(123);
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', 123]
    ]);
  });

  it('parses plain string', function() {
    const ast = QueryParser.parse('str');
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', 'str']
    ]);
  });

  it('parses plain boolean', function() {
    const ast = QueryParser.parse(true);
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', true]
    ]);
  });

  it('parses plain date', function() {
    const d = new Date();
    const ast = QueryParser.parse(d);
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', d]
    ]);
  });

  it('parses plain buffer', function() {
    const buf = new Buffer([1, 2, 3]);
    const ast = QueryParser.parse(buf);
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', buf]
    ]);
  });

  it('parses array or numbers', function() {
    const ast = QueryParser.parse([1, 2, 3]);
    assert.deepEqual(ast, [
      'IN',
      ['ID'],
      ['VALUES', 1, 2, 3]
    ]);
  });

  it('parses object with simple key-value assignment', function() {
    const ast = QueryParser.parse({a: 1});
    assert.deepEqual(ast, [
      'EQ',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with multiple key-value assignments', function() {
    const ast = QueryParser.parse({a: 1, b: 2, c: 3});
    assert.deepEqual(ast, [
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
    ]);
  });

  it('parses object with $eq operator', function() {
    const ast = QueryParser.parse({a: {$eq: 1}});
    assert.deepEqual(ast, [
      'EQ',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $ne operator', function() {
    const ast = QueryParser.parse({a: {$ne: 1}});
    assert.deepEqual(ast, [
      'NE',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $lt operator', function() {
    const ast = QueryParser.parse({a: {$lt: 1}});
    assert.deepEqual(ast, [
      'LT',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $lte operator', function() {
    const ast = QueryParser.parse({a: {$lte: 1}});
    assert.deepEqual(ast, [
      'LTE',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $gt operator', function() {
    const ast = QueryParser.parse({a: {$gt: 1}});
    assert.deepEqual(ast, [
      'GT',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $gte operator', function() {
    const ast = QueryParser.parse({a: {$gte: 1}});
    assert.deepEqual(ast, [
      'GTE',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $in operator', function() {
    const ast = QueryParser.parse({a: {$in: [1, 2, 3]}});
    assert.deepEqual(ast, [
      'IN',
      ['KEY', 'a'],
      ['VALUES', 1, 2, 3]
    ]);
  });

  it('parses object with $nin operator', function() {
    const ast = QueryParser.parse({a: {$nin: [1, 2, 3]}});
    assert.deepEqual(ast, [
      'NIN',
      ['KEY', 'a'],
      ['VALUES', 1, 2, 3]
    ]);
  });

  it('parses object with $like operator', function() {
    const ast = QueryParser.parse({a: {$like: 's%'}});
    assert.deepEqual(ast, [
      'LIKE',
      ['KEY', 'a'],
      ['VALUE', 's%']
    ]);
  });

  it('parses object with $nlike operator', function() {
    const ast = QueryParser.parse({a: {$nlike: 's%'}});
    assert.deepEqual(ast, [
      'NLIKE',
      ['KEY', 'a'],
      ['VALUE', 's%']
    ]);
  });

  it('parses object with $and operator', function() {
    const ast = QueryParser.parse({$and: [{a: 1}, {b: 2}]});
    assert.deepEqual(ast, [
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
    ]);
  });

  it('parses object with $or operator', function() {
    const ast = QueryParser.parse({$or: [{a: 1}, {a: 2}]});
    assert.deepEqual(ast, [
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
    ]);
  });
});
