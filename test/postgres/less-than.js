var assert = require('chai').assert;
var expression = require('../../src/postgres/query/expression');
var lessthan = require('../../src/postgres/query/expression.lt')(expression);

describe('Postgres less-than expression', function () {

  it('throws error when $lt is Array', function () {
    assert.throws(function () { lessthan([]); }, /invalid \$lt expression/i);
  });

  it('throws error when $lt is null', function () {
    assert.throws(function () { lessthan(null); }, /invalid \$lt expression/i);
  });

  it('returns valid SQL when $lt is string', function () {
    var result = lessthan('string');
    assert.strictEqual(result.sql, '< ?');
    assert.strictEqual(result.params[0], 'string');
  });

  it('returns valid SQL when $lt is number', function () {
    var result = lessthan(123);
    assert.strictEqual(result.sql, '< ?');
    assert.strictEqual(result.params[0], 123);
  });

  it('returns valid SQL when $lt is boolean', function () {
    var result = lessthan(false);
    assert.strictEqual(result.sql, '< ?');
    assert.strictEqual(result.params[0], false);
  });

  it('returns valid SQL when $lt is date', function () {
    var d = new Date();
    var result = lessthan(d);
    assert.strictEqual(result.sql, '< ?');
    assert.strictEqual(result.params[0], d);
  });

  it('returns valid SQL when $lt is buffer', function () {
    var buf = new Buffer('abcde');
    var result = lessthan(buf);
    assert.strictEqual(result.sql, '< ?');
    assert.strictEqual(result.params[0], buf);
  });

});
