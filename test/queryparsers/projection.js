/* eslint-env node, mocha */

import { assert } from 'chai';
import parseProjection from '../../src/queryparsers/projection';

describe('Projection parser', () => {
  it('accepts object with value 1', () => {
    const ast = parseProjection({ foo: 1 });
    assert.deepEqual(ast, [
      'PROJECTION', ['KEY', 'foo']
    ]);
  });

  it('accepts object with value -1', () => {
    const ast = parseProjection({ bar: -1 });
    assert.deepEqual(ast, [
      'NPROJECTION', ['KEY', 'bar']
    ]);
  });

  it('always gives precedence to value 1', () => {
    const ast = parseProjection({ foo: 1, bar: -1 });
    assert.deepEqual(ast, [
      'PROJECTION', ['KEY', 'foo']
    ]);
  });

  it('accepts null as $projection', () => {
    const ast = parseProjection(null);
    assert.deepEqual(ast, ['PROJECTION', null]);
  });

  it('accepts undefined $projection', () => {
    const ast = parseProjection();
    assert.deepEqual(ast, ['PROJECTION', null]);
  });

  it('throws error when $projection is of invalid type', () => {
    assert.throws(() => parseProjection(123), TypeError);
    assert.throws(() => parseProjection(true), TypeError);
    assert.throws(() => parseProjection('str'), TypeError);
    assert.throws(() => parseProjection([]), TypeError);
    assert.throws(() => parseProjection(new Date()), TypeError);
    assert.throws(() => parseProjection(() => {}), TypeError);
  });
});
