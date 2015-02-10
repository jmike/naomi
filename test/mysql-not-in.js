var assert = require('chai').assert;
var NotIn = require('../src/mysql/query/NotIn');

describe('MySQL NotIn', function () {

  describe('contructor', function () {

    it('throws error when $nin is undefined', function () {
      assert.throws(function () { new NotIn(); }, /Invalid \$nin argument/i);
    });

    it('throws error when $nin is object', function () {
      assert.throws(function () { new NotIn({}); }, /Invalid \$nin argument/i);
    });

    it('throws error when $nin is boolean', function () {
      assert.throws(function () { new NotIn(true); }, /Invalid \$nin argument/i);
      assert.throws(function () { new NotIn(false); }, /Invalid \$nin argument/i);
    });

    it('throws error when $nin is number', function () {
      assert.throws(function () { new NotIn(1); }, /Invalid \$nin argument/i);
    });

    it('throws error when $nin is strNotIng', function () {
      assert.throws(function () { new NotIn('strNotIng'); }, /Invalid \$nin argument/i);
    });

    it('throws error when $nin is null', function () {
      assert.throws(function () { new NotIn(null); }, /Invalid \$nin argument/i);
    });

    it('throws error when $nin is empty array', function () {
      assert.throws(function () { new NotIn([]); }, /Invalid \$nin argument/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $nin is not-empty array', function () {
      var query = new NotIn([1, 2]).toParamSQL();
      assert.strictEqual(query.sql, 'NOT IN (?, ?)');
      assert.strictEqual(query.params[0], 1);
      assert.strictEqual(query.params[1], 2);
    });

  });

});
