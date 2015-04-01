var assert = require('chai').assert;
var expression = require('../../src/mysql/query/expression');
var notlike = require('../../src/mysql/query/expression.nlike')(expression);

describe('MySQL not-like expression', function () {

  it('throws error when $nlike is undefined', function () {
    assert.throws(function () { notlike(); }, /invalid \$nlike expression/i);
  });

  it('throws error when $nlike is boolean', function () {
    assert.throws(function () { notlike(true); }, /invalid \$nlike expression/i);
    assert.throws(function () { notlike(false); }, /invalid \$nlike expression/i);
  });

  it('throws error when $nlike is number', function () {
    assert.throws(function () { notlike(1); }, /invalid \$nlike expression/i);
  });

  it('throws error when $nlike is array', function () {
    assert.throws(function () { notlike([]); }, /invalid \$nlike expression/i);
  });

  it('throws error when $nlike is null', function () {
    assert.throws(function () { notlike(null); }, /invalid \$nlike expression/i);
  });

  it('returns valid SQL when $nlike is string', function () {
    var result = notlike('string');
    assert.strictEqual(result.sql, 'NOT LIKE ?');
    assert.strictEqual(result.params[0], 'string');
  });

});
