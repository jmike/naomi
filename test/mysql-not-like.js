var assert = require('chai').assert;
var Expression = require('../src/mysql/query/Expression');
var NotLike = require('../src/mysql/query/Expression.NotLike')(Expression);

describe('MySQL NotLike Expression', function () {

  describe('contructor', function () {

    it('throws error when $nlike is undefined', function () {
      assert.throws(function () { new NotLike(); }, /invalid \$nlike expression/i);
    });

    it('throws error when $nlike is boolean', function () {
      assert.throws(function () { new NotLike(true); }, /invalid \$nlike expression/i);
      assert.throws(function () { new NotLike(false); }, /invalid \$nlike expression/i);
    });

    it('throws error when $nlike is number', function () {
      assert.throws(function () { new NotLike(1); }, /invalid \$nlike expression/i);
    });

    it('throws error when $nlike is array', function () {
      assert.throws(function () { new NotLike([]); }, /invalid \$nlike expression/i);
    });

    it('throws error when $nlike is null', function () {
      assert.throws(function () { new NotLike(null); }, /invalid \$nlike expression/i);
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
