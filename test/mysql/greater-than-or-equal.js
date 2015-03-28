var assert = require('chai').assert;
var expression = require('../../src/mysql/query/expression');
var greaterthanorequal = require('../../src/mysql/query/expression.gte')(expression);

describe('MySQL greater-than-or-equal expression', function () {

  it('throws error when $gte is Array', function () {
    assert.throws(function () { greaterthanorequal([]); }, /invalid \$gte expression/i);
  });

  it('throws error when $gte is null', function () {
    assert.throws(function () { greaterthanorequal(null); }, /invalid \$gte expression/i);
  });

  it('returns valid SQL when $gte is string', function () {
    var query = greaterthanorequal('string');
    assert.strictEqual(query.sql, '>= ?');
    assert.strictEqual(query.params[0], 'string');
  });

  it('returns valid SQL when $gte is number', function () {
    var query = greaterthanorequal(123);
    assert.strictEqual(query.sql, '>= ?');
    assert.strictEqual(query.params[0], 123);
  });

  it('returns valid SQL when $gte is boolean', function () {
    var query = greaterthanorequal(false);
    assert.strictEqual(query.sql, '>= ?');
    assert.strictEqual(query.params[0], false);
  });

  it('returns valid SQL when $gte is date', function () {
    var d = new Date();
    var query = greaterthanorequal(d);
    assert.strictEqual(query.sql, '>= ?');
    assert.strictEqual(query.params[0], d);
  });

  it('returns valid SQL when $gte is buffer', function () {
    var buf = new Buffer('abcde');
    var query = greaterthanorequal(buf);
    assert.strictEqual(query.sql, '>= ?');
    assert.strictEqual(query.params[0], buf);
  });

});
