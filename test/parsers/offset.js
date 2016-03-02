/* global describe, it */

import {assert} from 'chai';
import parseOffset from '../../src/parsers/offset';

describe('Offset parser', function() {
  it('accepts positive integer', function() {
    const ast = parseOffset(1);
    assert.deepEqual(ast, ['OFFSET', 1]);
  });

  it('accepts zero (0) offset', function() {
    const ast = parseOffset(0);
    assert.deepEqual(ast, ['OFFSET', 0]);
  });

  it('accepts null offset', function() {
    const ast = parseOffset(null);
    assert.deepEqual(ast, ['OFFSET', null]);
  });

  it('accepts undefined offset', function() {
    const ast = parseOffset();
    assert.deepEqual(ast, ['OFFSET', null]);
  });

  it('throws error when offset is negative', function () {
    assert.throws(() => parseOffset(-1), Error);
    assert.throws(() => parseOffset(-99), Error);
  });

  it('throws error when offset is float', function () {
    assert.throws(() => parseOffset(0.1), Error);
  });
});
