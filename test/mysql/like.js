var assert = require('chai').assert;
var expression = require('../../src/mysql/query/expression');
var like = require('../../src/mysql/query/expression.like')(expression);

describe('MySQL like expression', function () {

  it('throws error when $like is undefined', function () {
    assert.throws(function () { like(); }, /invalid \$like expression/i);
  });

  it('throws error when $like is boolean', function () {
    assert.throws(function () { like(true); }, /invalid \$like expression/i);
    assert.throws(function () { like(false); }, /invalid \$like expression/i);
  });

  it('throws error when $like is number', function () {
    assert.throws(function () { like(1); }, /invalid \$like expression/i);
  });

  it('throws error when $like is array', function () {
    assert.throws(function () { like([]); }, /invalid \$like expression/i);
  });

  it('throws error when $like is null', function () {
    assert.throws(function () { like(null); }, /invalid \$like expression/i);
  });

  it('returns valid SQL when $like is string', function () {
    var result = like('string');
    assert.strictEqual(result.sql, 'LIKE ?');
    assert.strictEqual(result.params[0], 'string');
  });

});
