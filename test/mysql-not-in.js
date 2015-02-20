var assert = require('chai').assert;
var expression = require('../src/mysql/query/expression');
var notin = require('../src/mysql/query/expression.nin')(expression);

describe('MySQL not-in expression', function () {

  it('throws error when $nin is undefined', function () {
    assert.throws(function () { notin(); }, /Invalid \$nin expression/i);
  });

  it('throws error when $nin is boolean', function () {
    assert.throws(function () { notin(true); }, /Invalid \$nin expression/i);
    assert.throws(function () { notin(false); }, /Invalid \$nin expression/i);
  });

  it('throws error when $nin is number', function () {
    assert.throws(function () { notin(1); }, /Invalid \$nin expression/i);
  });

  it('throws error when $nin is strnoting', function () {
    assert.throws(function () { notin('strnoting'); }, /Invalid \$nin expression/i);
  });

  it('throws error when $nin is null', function () {
    assert.throws(function () { notin(null); }, /Invalid \$nin expression/i);
  });

  it('throws error when $nin is empty array', function () {
    assert.throws(function () { notin([]); }, /Invalid \$nin expression/i);
  });

  it('returns valid SQL when $nin is not-empty array', function () {
    var result = notin([1, 2]);
    assert.strictEqual(result.sql, 'NOT IN (?, ?)');
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 2);
  });

});
