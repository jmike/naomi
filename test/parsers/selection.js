/* global describe, it */

import {assert} from 'chai';
import parseSelection from '../../src/parsers/selection';

describe('Selection parser', function() {
  it('parses plain number', function() {
    const ast = parseSelection(123);
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', 123]
      ]
    ]);
  });

  it('parses plain string', function() {
    const ast = parseSelection('str');
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', 'str']
      ]
    ]);
  });

  it('parses plain boolean', function() {
    const ast = parseSelection(true);
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
    const ast = parseSelection(d);
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
    const ast = parseSelection(buf);
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', buf]
      ]
    ]);
  });

  it('parses array or numbers', function() {
    const ast = parseSelection([1, 2, 3]);
    assert.deepEqual(ast, [
      'SELECTION', [
        'IN',
        ['ID'],
        ['VALUES', 1, 2, 3]
      ]
    ]);
  });

  it('parses object with simple key-value assignment', function() {
    const ast = parseSelection({a: 1});
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses object with multiple key-value assignments', function() {
    const ast = parseSelection({a: 1, b: 2, c: 3});
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
    const ast = parseSelection({a: {$eq: 1}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $ne operator', function() {
    const ast = parseSelection({a: {$ne: 1}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'NE',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $lt operator', function() {
    const ast = parseSelection({a: {$lt: 1}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'LT',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $lte operator', function() {
    const ast = parseSelection({a: {$lte: 1}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'LTE',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $gt operator', function() {
    const ast = parseSelection({a: {$gt: 1}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'GT',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $gte operator', function() {
    const ast = parseSelection({a: {$gte: 1}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'GTE',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $in operator', function() {
    const ast = parseSelection({a: {$in: [1, 2, 3]}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'IN',
        ['KEY', 'a'],
        ['VALUES', 1, 2, 3]
      ]
    ]);
  });

  it('parses expression with $nin operator', function() {
    const ast = parseSelection({a: {$nin: [1, 2, 3]}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'NIN',
        ['KEY', 'a'],
        ['VALUES', 1, 2, 3]
      ]
    ]);
  });

  it('parses expression with $like operator', function() {
    const ast = parseSelection({a: {$like: 's%'}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'LIKE',
        ['KEY', 'a'],
        ['VALUE', 's%']
      ]
    ]);
  });

  it('parses expression with $nlike operator', function() {
    const ast = parseSelection({a: {$nlike: 's%'}});
    assert.deepEqual(ast, [
      'SELECTION', [
        'NLIKE',
        ['KEY', 'a'],
        ['VALUE', 's%']
      ]
    ]);
  });

  it('parses expression with $and operator', function() {
    const ast = parseSelection({$and: [{a: 1}, {b: 2}]});
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
    const ast = parseSelection({$or: [{a: 1}, {a: 2}]});
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
