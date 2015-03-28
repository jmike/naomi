var assert = require('chai').assert;
var expression = require('../../src/mysql/query/expression');
var greaterthan = require('../../src/mysql/query/expression.gt')(expression);

describe('MySQL greater-than expression', function () {

  it('throws error when $gt is Array', function () {
    assert.throws(function () { greaterthan([]); }, /invalid \$gt expression/i);
  });

  it('throws error when $gt is null', function () {
    assert.throws(function () { greaterthan(null); }, /invalid \$gt expression/i);
  });

  it('returns valid SQL when $gt is string', function () {
    var query = greaterthan('string');
    assert.strictEqual(query.sql, '> ?');
    assert.strictEqual(query.params[0], 'string');
  });

  it('returns valid SQL when $gt is number', function () {
    var query = greaterthan(123);
    assert.strictEqual(query.sql, '> ?');
    assert.strictEqual(query.params[0], 123);
  });

  it('returns valid SQL when $gt is boolean', function () {
    var query = greaterthan(false);
    assert.strictEqual(query.sql, '> ?');
    assert.strictEqual(query.params[0], false);
  });

  it('returns valid SQL when $gt is date', function () {
    var d = new Date();
    var query = greaterthan(d);
    assert.strictEqual(query.sql, '> ?');
    assert.strictEqual(query.params[0], d);
  });

  it('returns valid SQL when $gt is buffer', function () {
    var buf = new Buffer('abcde');
    var query = greaterthan(buf);
    assert.strictEqual(query.sql, '> ?');
    assert.strictEqual(query.params[0], buf);
  });

});
