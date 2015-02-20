var assert = require('chai').assert;
var expression = require('../src/mysql/query/expression');
var equal = require('../src/mysql/query/expression.eq')(expression);

describe('MySQL equal expression', function () {

  it('throws error when $eq is Array', function () {
    assert.throws(function () { equal([]); }, /invalid \$eq expression/i);
  });

  it('accepts null values', function () {
    assert.doesNotThrow(function () { equal(null); });
  });

  it('returns valid SQL when $eq is null', function () {
    var query = equal(null);
    assert.strictEqual(query.sql, 'IS NULL');
    assert.lengthOf(query.params, 0);
  });

  it('returns valid SQL when $eq is string', function () {
    var query = equal('string');
    assert.strictEqual(query.sql, '= ?');
    assert.strictEqual(query.params[0], 'string');
  });

  it('returns valid SQL when $eq is number', function () {
    var query = equal(123);
    assert.strictEqual(query.sql, '= ?');
    assert.strictEqual(query.params[0], 123);
  });

  it('returns valid SQL when $eq is boolean', function () {
    var query = equal(false);
    assert.strictEqual(query.sql, '= ?');
    assert.strictEqual(query.params[0], false);
  });

  it('returns valid SQL when $eq is date', function () {
    var d = new Date();
    var query = equal(d);
    assert.strictEqual(query.sql, '= ?');
    assert.strictEqual(query.params[0], d);
  });

  it('returns valid SQL when $eq is buffer', function () {
    var buf = new Buffer('abcde');
    var query = equal(buf);
    assert.strictEqual(query.sql, '= ?');
    assert.strictEqual(query.params[0], buf);
  });

});
