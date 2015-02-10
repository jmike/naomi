var assert = require('chai').assert;
var NotLike = require('../src/mysql/query/NotLike');

describe('MySQL NotLike', function () {

  describe('contructor', function () {

    it('throws error when $nlike is undefined', function () {
      assert.throws(function () { new NotLike(); }, /invalid \$nlike argument/i);
    });

    it('throws error when $nlike is object', function () {
      assert.throws(function () { new NotLike({}); }, /invalid \$nlike argument/i);
    });

    it('throws error when $nlike is boolean', function () {
      assert.throws(function () { new NotLike(true); }, /invalid \$nlike argument/i);
      assert.throws(function () { new NotLike(false); }, /invalid \$nlike argument/i);
    });

    it('throws error when $nlike is number', function () {
      assert.throws(function () { new NotLike(1); }, /invalid \$nlike argument/i);
    });

    it('throws error when $nlike is array', function () {
      assert.throws(function () { new NotLike([]); }, /invalid \$nlike argument/i);
    });

    it('throws error when $nlike is null', function () {
      assert.throws(function () { new NotLike(null); }, /invalid \$nlike argument/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $nlike is string', function () {
      var query = new NotLike('string').toParamSQL();
      assert.strictEqual(query.sql, 'NOT LIKE ?');
      assert.strictEqual(query.params[0], 'string');
    });

  });

});
