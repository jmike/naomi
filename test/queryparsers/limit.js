/* global describe, it */

import {assert} from 'chai';
import parseLimit from '../../src/queryparsers/limit';

describe('Limit parser', function() {
  it('accepts positive integer', function() {
    const ast = parseLimit(1);
    assert.deepEqual(ast, ['LIMIT', 1]);
  });

  it('accepts null limit', function() {
    const ast = parseLimit(null);
    assert.deepEqual(ast, ['LIMIT', null]);
  });

  it('accepts undefined limit', function() {
    const ast = parseLimit();
    assert.deepEqual(ast, ['LIMIT', null]);
  });

  it('throws error when limit is zero (0) or negative', function () {
    assert.throws(() => parseLimit(0), Error);
    assert.throws(() => parseLimit(-1), Error);
    assert.throws(() => parseLimit(-99), Error);
  });

  it('throws error when limit is float', function () {
    assert.throws(() => parseLimit(0.1), Error);
  });
});
