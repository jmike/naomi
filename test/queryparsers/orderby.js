/* eslint-env node, mocha */

import { assert } from 'chai';
import parseOrderBy from '../../src/queryparsers/orderBy';

describe('OrderBy parser', () => {
  it('accepts string as $orderby', () => {
    const ast = parseOrderBy('foo');
    assert.deepEqual(ast, [
      'ORDERBY',
      ['ASC', ['KEY', 'foo']]
    ]);
  });

  it('accepts object as $orderby', () => {
    const ast = parseOrderBy({ foo: -1 });
    assert.deepEqual(ast, [
      'ORDERBY',
      ['DESC', ['KEY', 'foo']]
    ]);
  });

  it('accepts array of strings as $orderby', () => {
    const ast = parseOrderBy(['foo', 'bar']);
    assert.deepEqual(ast, [
      'ORDERBY',
      ['ASC', ['KEY', 'foo']],
      ['ASC', ['KEY', 'bar']]
    ]);
  });

  it('accepts array of objects as $orderby', () => {
    const ast = parseOrderBy([{ foo: -1 }, { bar: 1 }]);
    assert.deepEqual(ast, [
      'ORDERBY',
      ['DESC', ['KEY', 'foo']],
      ['ASC', ['KEY', 'bar']]
    ]);
  });

  it('accepts array of mixed strings and objects as $orderby', () => {
    const ast = parseOrderBy([{ foo: -1 }, 'bar']);
    assert.deepEqual(ast, [
      'ORDERBY',
      ['DESC', ['KEY', 'foo']],
      ['ASC', ['KEY', 'bar']]
    ]);
  });

  it('accepts null as $orderby', () => {
    const ast = parseOrderBy(null);
    assert.deepEqual(ast, ['ORDERBY', null]);
  });

  it('accepts undefined $orderby', () => {
    const ast = parseOrderBy();
    assert.deepEqual(ast, ['ORDERBY', null]);
  });

  it('throws error when $orderby is of invalid type', () => {
    assert.throws(() => parseOrderBy(123), TypeError);
    assert.throws(() => parseOrderBy(true), TypeError);
    assert.throws(() => parseOrderBy(new Date()), TypeError);
    assert.throws(() => parseOrderBy(() => {}), TypeError);
  });

  it('throws error when $orderby array contains invalid values', () => {
    assert.throws(() => parseOrderBy(['foo', 123]), Error);
    assert.throws(() => parseOrderBy(['foo', true]), Error);
    assert.throws(() => parseOrderBy(['foo', new Date()]), Error);
    assert.throws(() => parseOrderBy(['foo', () => {}]), Error);
  });

  it('throws error when $orderby object contains more than one properties', () => {
    assert.throws(() => parseOrderBy({ a: -1, b: 1 }), Error);
  });

  it('throws error when $orderby object value is not one of -1 or 1', () => {
    assert.throws(() => parseOrderBy({ foo: 2 }), Error);
    assert.throws(() => parseOrderBy({ foo: 0 }), Error);
    assert.throws(() => parseOrderBy({ foo: -99 }), Error);
  });
});
