var assert = require('chai').assert;
var Expression = require('../src/mysql/query/Expression');
var Like = require('../src/mysql/query/Expression.Like')(Expression);

describe('MySQL Like Expression', function () {

  describe('contructor', function () {

    it('throws error when $like is undefined', function () {
      assert.throws(function () { new Like(); }, /invalid \$like expression/i);
    });

    it('throws error when $like is boolean', function () {
      assert.throws(function () { new Like(true); }, /invalid \$like expression/i);
      assert.throws(function () { new Like(false); }, /invalid \$like expression/i);
    });

    it('throws error when $like is number', function () {
      assert.throws(function () { new Like(1); }, /invalid \$like expression/i);
    });

    it('throws error when $like is array', function () {
      assert.throws(function () { new Like([]); }, /invalid \$like expression/i);
    });

    it('throws error when $like is null', function () {
      assert.throws(function () { new Like(null); }, /invalid \$like expression/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $like is string', function () {
      var query = new Like('string').toParamSQL();
      assert.strictEqual(query.sql, 'LIKE ?');
      assert.strictEqual(query.params[0], 'string');
    });

  });

});
