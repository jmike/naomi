/* eslint-env node, mocha */

import { assert } from 'chai';
import parseOffset from '../../src/queryparsers/offset';

describe('Offset parser', () => {
  it('accepts positive integer', () => {
    const ast = parseOffset(1);
    assert.deepEqual(ast, ['OFFSET', 1]);
  });

  it('accepts zero (0) offset', () => {
    const ast = parseOffset(0);
    assert.deepEqual(ast, ['OFFSET', 0]);
  });

  it('accepts null offset', () => {
    const ast = parseOffset(null);
    assert.deepEqual(ast, ['OFFSET', null]);
  });

  it('accepts undefined offset', () => {
    const ast = parseOffset();
    assert.deepEqual(ast, ['OFFSET', null]);
  });

  it('throws error when offset is negative', () => {
    assert.throws(() => parseOffset(-1), Error);
    assert.throws(() => parseOffset(-99), Error);
  });

  it('throws error when offset is float', () => {
    assert.throws(() => parseOffset(0.1), Error);
  });
});
