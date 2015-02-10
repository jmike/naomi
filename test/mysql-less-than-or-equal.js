var assert = require('chai').assert;
var LessThanOrEqual = require('../src/mysql/query/LessThanOrEqual');

describe('MySQL LessThanOrEqual', function () {

  describe('constructor', function () {

    it('throws error when $lte is Object', function () {
      assert.throws(function () { new LessThanOrEqual({}); }, /invalid \$lte argument/i);
    });

    it('throws error when $lte is Array', function () {
      assert.throws(function () { new LessThanOrEqual([]); }, /invalid \$lte argument/i);
    });

    it('throws error when $lte is null', function () {
      assert.throws(function () { new LessThanOrEqual(null); }, /invalid \$lte argument/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $lte is string', function () {
      var query = new LessThanOrEqual('string').toParamSQL();
      assert.strictEqual(query.sql, '<= ?');
      assert.strictEqual(query.params[0], 'string');
    });

    it('returns valid SQL when $lte is number', function () {
      var query = new LessThanOrEqual(123).toParamSQL();
      assert.strictEqual(query.sql, '<= ?');
      assert.strictEqual(query.params[0], 123);
    });

    it('returns valid SQL when $lte is boolean', function () {
      var query = new LessThanOrEqual(false).toParamSQL();
      assert.strictEqual(query.sql, '<= ?');
      assert.strictEqual(query.params[0], false);
    });

    it('returns valid SQL when $lte is boolean', function () {
      var d = new Date();
      var query = new LessThanOrEqual(d).toParamSQL();
      assert.strictEqual(query.sql, '<= ?');
      assert.strictEqual(query.params[0], d);
    });

    it('returns valid SQL when $lte is boolean', function () {
      var buf = new Buffer('abcde');
      var query = new LessThanOrEqual(buf).toParamSQL();
      assert.strictEqual(query.sql, '<= ?');
      assert.strictEqual(query.params[0], buf);
    });

  });

});
