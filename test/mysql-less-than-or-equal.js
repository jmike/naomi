var assert = require('chai').assert;
var expression = require('../src/mysql/query/expression');
var lessthanorequal = require('../src/mysql/query/expression.lte')(expression);

describe('MySQL less-than-or-equal expression', function () {

  it('throws error when $lte is Array', function () {
    assert.throws(function () { lessthanorequal([]); }, /invalid \$lte expression/i);
  });

  it('throws error when $lte is null', function () {
    assert.throws(function () { lessthanorequal(null); }, /invalid \$lte expression/i);
  });

  it('returns valid SQL when $lte is string', function () {
    var result = lessthanorequal('string');
    assert.strictEqual(result.sql, '<= ?');
    assert.strictEqual(result.params[0], 'string');
  });

  it('returns valid SQL when $lte is number', function () {
    var result = lessthanorequal(123);
    assert.strictEqual(result.sql, '<= ?');
    assert.strictEqual(result.params[0], 123);
  });

  it('returns valid SQL when $lte is boolean', function () {
    var result = lessthanorequal(false);
    assert.strictEqual(result.sql, '<= ?');
    assert.strictEqual(result.params[0], false);
  });

  it('returns valid SQL when $lte is date', function () {
    var d = new Date();
    var result = lessthanorequal(d);
    assert.strictEqual(result.sql, '<= ?');
    assert.strictEqual(result.params[0], d);
  });

  it('returns valid SQL when $lte is buffer', function () {
    var buf = new Buffer('abcde');
    var result = lessthanorequal(buf);
    assert.strictEqual(result.sql, '<= ?');
    assert.strictEqual(result.params[0], buf);
  });

});
