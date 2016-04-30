/* eslint-env node, mocha */

import { assert } from 'chai';
import parseLimit from '../../src/queryparsers/limit';

describe('Limit parser', () => {
  it('accepts positive integer', () => {
    const ast = parseLimit(1);
    assert.deepEqual(ast, ['LIMIT', 1]);
  });

  it('accepts null limit', () => {
    const ast = parseLimit(null);
    assert.deepEqual(ast, ['LIMIT', null]);
  });

  it('accepts undefined limit', () => {
    const ast = parseLimit();
    assert.deepEqual(ast, ['LIMIT', null]);
  });

  it('throws error when limit is zero (0) or negative', () => {
    assert.throws(() => parseLimit(0), Error);
    assert.throws(() => parseLimit(-1), Error);
    assert.throws(() => parseLimit(-99), Error);
  });

  it('throws error when limit is float', () => {
    assert.throws(() => parseLimit(0.1), Error);
  });
});
