var assert = require('chai').assert;
var expression = require('../../src/mysql/query/expression');
var notequal = require('../../src/mysql/query/expression.ne')(expression);

describe('MySQL not-equal expression', function () {

  it('throws error when $ne is Array', function () {
    assert.throws(function () { notequal([]); }, /invalid \$ne expression/i);
  });

  it('accepts null values', function () {
    assert.doesNotThrow(function () { notequal(null); });
  });

  it('returns valid SQL when $ne is null', function () {
    var result = notequal(null);
    assert.strictEqual(result.sql, 'IS NOT NULL');
    assert.lengthOf(result.params, 0);
  });

  it('returns valid SQL when $ne is string', function () {
    var result = notequal('string');
    assert.strictEqual(result.sql, '!= ?');
    assert.strictEqual(result.params[0], 'string');
  });

  it('returns valid SQL when $ne is number', function () {
    var result = notequal(123);
    assert.strictEqual(result.sql, '!= ?');
    assert.strictEqual(result.params[0], 123);
  });

  it('returns valid SQL when $ne is boolean', function () {
    var result = notequal(false);
    assert.strictEqual(result.sql, '!= ?');
    assert.strictEqual(result.params[0], false);
  });

  it('returns valid SQL when $ne is date', function () {
    var d = new Date();
    var result = notequal(d);
    assert.strictEqual(result.sql, '!= ?');
    assert.strictEqual(result.params[0], d);
  });

  it('returns valid SQL when $ne is buffer', function () {
    var buf = new Buffer('abcde');
    var result = notequal(buf);
    assert.strictEqual(result.sql, '!= ?');
    assert.strictEqual(result.params[0], buf);
  });

});
