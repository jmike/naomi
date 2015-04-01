var assert = require('chai').assert;
var expression = require('../../src/mysql/query/expression');
var inexp = require('../../src/mysql/query/expression.in')(expression);

describe('MySQL in expression', function () {

  it('throws error when $in is undefined', function () {
    assert.throws(function () { inexp(); }, /invalid \$in expression/i);
  });

  it('throws error when $in is boolean', function () {
    assert.throws(function () { inexp(true); }, /invalid \$in expression/i);
    assert.throws(function () { inexp(false); }, /invalid \$in expression/i);
  });

  it('throws error when $in is number', function () {
    assert.throws(function () { inexp(1); }, /invalid \$in expression/i);
  });

  it('throws error when $in is string', function () {
    assert.throws(function () { inexp('string'); }, /invalid \$in expression/i);
  });

  it('throws error when $in is null', function () {
    assert.throws(function () { inexp(null); }, /invalid \$in expression/i);
  });

  it('throws error when $in is empty array', function () {
    assert.throws(function () { inexp([]); }, /invalid \$in expression/i);
  });

  it('returns valid SQL when $in is not-empty array', function () {
    var result = inexp([1, 2]);
    assert.strictEqual(result.sql, 'IN (?, ?)');
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 2);
  });

});
