var assert = require('chai').assert;
var In = require('../src/mysql/query/In');

describe('MySQL In', function () {

  describe('contructor', function () {

    it('throws error when $in is undefined', function () {
      assert.throws(function () { new In(); }, /invalid \$in argument/i);
    });

    it('throws error when $in is object', function () {
      assert.throws(function () { new In({}); }, /invalid \$in argument/i);
    });

    it('throws error when $in is boolean', function () {
      assert.throws(function () { new In(true); }, /invalid \$in argument/i);
      assert.throws(function () { new In(false); }, /invalid \$in argument/i);
    });

    it('throws error when $in is number', function () {
      assert.throws(function () { new In(1); }, /invalid \$in argument/i);
    });

    it('throws error when $in is string', function () {
      assert.throws(function () { new In('string'); }, /invalid \$in argument/i);
    });

    it('throws error when $in is null', function () {
      assert.throws(function () { new In(null); }, /invalid \$in argument/i);
    });

    it('throws error when $in is empty array', function () {
      assert.throws(function () { new In([]); }, /invalid \$in argument/i);
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
