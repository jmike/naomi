/* eslint-env node, mocha */

import { assert } from 'chai';
import parseSelection from '../../src/queryparsers/selection';

describe('Selection parser', () => {
  it('parses plain number', () => {
    const ast = parseSelection(123);
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', 123]
      ]
    ]);
  });

  it('parses plain string', () => {
    const ast = parseSelection('str');
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', 'str']
      ]
    ]);
  });

  it('parses plain boolean', () => {
    const ast = parseSelection(true);
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['ID'],
        ['VALUE', true]
      ]
    ]);
  });

  it('parses plain date', () => {
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

  it('parses plain buffer', () => {
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

  it('parses array or numbers', () => {
    const ast = parseSelection([1, 2, 3]);
    assert.deepEqual(ast, [
      'SELECTION', [
        'OR',
        [
          'EQ',
          ['ID'],
          ['VALUE', 1]
        ],
        [
          'EQ',
          ['ID'],
          ['VALUE', 2]
        ],
        [
          'EQ',
          ['ID'],
          ['VALUE', 3]
        ],
      ]
    ]);
  });

  it('parses array or objects', () => {
    const ast = parseSelection([{ a: 1 }, { a: 2 }, { a: 3 }]);
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
        ],
        [
          'EQ',
          ['KEY', 'a'],
          ['VALUE', 3]
        ],
      ]
    ]);
  });

  it('parses object with simple key-value assignment', () => {
    const ast = parseSelection({ a: 1 });
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses object with multiple key-value assignments', () => {
    const ast = parseSelection({ a: 1, b: 2, c: 3 });
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

  it('parses expression with $eq operator', () => {
    const ast = parseSelection({ a: { $eq: 1 } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'EQ',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $ne operator', () => {
    const ast = parseSelection({ a: { $ne: 1 } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'NE',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $lt operator', () => {
    const ast = parseSelection({ a: { $lt: 1 } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'LT',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $lte operator', () => {
    const ast = parseSelection({ a: { $lte: 1 } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'LTE',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $gt operator', () => {
    const ast = parseSelection({ a: { $gt: 1 } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'GT',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $gte operator', () => {
    const ast = parseSelection({ a: { $gte: 1 } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'GTE',
        ['KEY', 'a'],
        ['VALUE', 1]
      ]
    ]);
  });

  it('parses expression with $in operator', () => {
    const ast = parseSelection({ a: { $in: [1, 2, 3] } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'IN',
        ['KEY', 'a'],
        ['VALUES', 1, 2, 3]
      ]
    ]);
  });

  it('parses expression with $nin operator', () => {
    const ast = parseSelection({ a: { $nin: [1, 2, 3] } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'NIN',
        ['KEY', 'a'],
        ['VALUES', 1, 2, 3]
      ]
    ]);
  });

  it('parses expression with $like operator', () => {
    const ast = parseSelection({ a: { $like: 's%' } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'LIKE',
        ['KEY', 'a'],
        ['VALUE', 's%']
      ]
    ]);
  });

  it('parses expression with $nlike operator', () => {
    const ast = parseSelection({ a: { $nlike: 's%' } });
    assert.deepEqual(ast, [
      'SELECTION', [
        'NLIKE',
        ['KEY', 'a'],
        ['VALUE', 's%']
      ]
    ]);
  });

  it('parses expression with $and operator', () => {
    const ast = parseSelection({ $and: [{ a: 1 }, { b: 2 }] });
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

  it('parses expression with $or operator', () => {
    const ast = parseSelection({ $or: [{ a: 1 }, { a: 2 }] });
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
