import {assert} from 'chai';
import Expr from '../src/queryparser/Expr';

describe('Queryparser', function() {
  it('parses plain number', function() {
    const ast = Expr.parse(123);
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', 123]
    ]);
  });

  it('parses plain string', function() {
    const ast = Expr.parse('str');
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', 'str']
    ]);
  });

  it('parses plain boolean', function() {
    const ast = Expr.parse(true);
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', true]
    ]);
  });

  it('parses plain date', function() {
    const d = new Date();
    const ast = Expr.parse(d);
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', d]
    ]);
  });

  it('parses plain buffer', function() {
    const buf = new Buffer([1, 2, 3]);
    const ast = Expr.parse(buf);
    assert.deepEqual(ast, [
      'EQ',
      ['ID'],
      ['VALUE', buf]
    ]);
  });

  it('parses array or numbers', function() {
    const ast = Expr.parse([1, 2, 3]);
    assert.deepEqual(ast, [
      'IN',
      ['ID'],
      ['VALUES', 1, 2, 3]
    ]);
  });

  it('parses object with simple key-value assignment', function() {
    const ast = Expr.parse({a: 1});
    assert.deepEqual(ast, [
      'EQ',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with multiple key-value assignments', function() {
    const ast = Expr.parse({a: 1, b: 2, c: 3});
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
    const ast = Expr.parse({a: {$eq: 1}});
    assert.deepEqual(ast, [
      'EQ',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $ne operator', function() {
    const ast = Expr.parse({a: {$ne: 1}});
    assert.deepEqual(ast, [
      'NE',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $lt operator', function() {
    const ast = Expr.parse({a: {$lt: 1}});
    assert.deepEqual(ast, [
      'LT',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $lte operator', function() {
    const ast = Expr.parse({a: {$lte: 1}});
    assert.deepEqual(ast, [
      'LTE',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $gt operator', function() {
    const ast = Expr.parse({a: {$gt: 1}});
    assert.deepEqual(ast, [
      'GT',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $gte operator', function() {
    const ast = Expr.parse({a: {$gte: 1}});
    assert.deepEqual(ast, [
      'GTE',
      ['KEY', 'a'],
      ['VALUE', 1]
    ]);
  });

  it('parses object with $in operator', function() {
    const ast = Expr.parse({a: {$in: [1, 2, 3]}});
    assert.deepEqual(ast, [
      'IN',
      ['KEY', 'a'],
      ['VALUES', 1, 2, 3]
    ]);
  });

  it('parses object with $nin operator', function() {
    const ast = Expr.parse({a: {$nin: [1, 2, 3]}});
    assert.deepEqual(ast, [
      'NIN',
      ['KEY', 'a'],
      ['VALUES', 1, 2, 3]
    ]);
  });

  it('parses object with $like operator', function() {
    const ast = Expr.parse({a: {$like: 's%'}});
    assert.deepEqual(ast, [
      'LIKE',
      ['KEY', 'a'],
      ['VALUE', 's%']
    ]);
  });

  it('parses object with $nlike operator', function() {
    const ast = Expr.parse({a: {$nlike: 's%'}});
    assert.deepEqual(ast, [
      'NLIKE',
      ['KEY', 'a'],
      ['VALUE', 's%']
    ]);
  });

  it('parses object with $and operator', function() {
    const ast = Expr.parse({$and: [{a: 1}, {b: 2}]});
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
    const ast = Expr.parse({$or: [{a: 1}, {a: 2}]});
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
