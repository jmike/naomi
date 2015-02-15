var assert = require('chai').assert;
var Expression = require('../src/mysql/query/Expression');
var In = require('../src/mysql/query/Expression.In')(Expression);

describe('MySQL In Expression', function () {

  describe('contructor', function () {

    it('throws error when $in is undefined', function () {
      assert.throws(function () { new In(); }, /invalid \$in expression/i);
    });

    it('throws error when $in is boolean', function () {
      assert.throws(function () { new In(true); }, /invalid \$in expression/i);
      assert.throws(function () { new In(false); }, /invalid \$in expression/i);
    });

    it('throws error when $in is number', function () {
      assert.throws(function () { new In(1); }, /invalid \$in expression/i);
    });

    it('throws error when $in is string', function () {
      assert.throws(function () { new In('string'); }, /invalid \$in expression/i);
    });

    it('throws error when $in is null', function () {
      assert.throws(function () { new In(null); }, /invalid \$in expression/i);
    });

    it('throws error when $in is empty array', function () {
      assert.throws(function () { new In([]); }, /invalid \$in expression/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $in is not-empty array', function () {
      var query = new In([1, 2]).toParamSQL();
      assert.strictEqual(query.sql, 'IN (?, ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 2);
    });

  });

});
