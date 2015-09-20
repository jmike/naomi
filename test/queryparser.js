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

  it('parses object with $eq operator', function() {
    const ast = Expr.parse({a: {$eq: 1}});
    assert.deepEqual(ast, [
      'EQ',
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
