var assert = require('chai').assert;
var GreaterThanOrEqual = require('../src/mysql/query/GreaterThanOrEqual');

describe('MySQL GreaterThanOrEqual', function () {

  describe('constructor', function () {

    it('throws error when $gte is Object', function () {
      assert.throws(function () { new GreaterThanOrEqual({}); }, /invalid \$gte argument/i);
    });

    it('throws error when $gte is Array', function () {
      assert.throws(function () { new GreaterThanOrEqual([]); }, /invalid \$gte argument/i);
    });

    it('throws error when $gte is null', function () {
      assert.throws(function () { new GreaterThanOrEqual(null); }, /invalid \$gte argument/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $gte is string', function () {
      var query = new GreaterThanOrEqual('string').toParamSQL();
      assert.strictEqual(query.sql, '>= ?');
      assert.strictEqual(query.params[0], 'string');
    });

    it('returns valid SQL when $gte is number', function () {
      var query = new GreaterThanOrEqual(123).toParamSQL();
      assert.strictEqual(query.sql, '>= ?');
      assert.strictEqual(query.params[0], 123);
    });

    it('returns valid SQL when $gte is boolean', function () {
      var query = new GreaterThanOrEqual(false).toParamSQL();
      assert.strictEqual(query.sql, '>= ?');
      assert.strictEqual(query.params[0], false);
    });

    it('returns valid SQL when $gte is boolean', function () {
      var d = new Date();
      var query = new GreaterThanOrEqual(d).toParamSQL();
      assert.strictEqual(query.sql, '>= ?');
      assert.strictEqual(query.params[0], d);
    });

    it('returns valid SQL when $gte is boolean', function () {
      var buf = new Buffer('abcde');
      var query = new GreaterThanOrEqual(buf).toParamSQL();
      assert.strictEqual(query.sql, '>= ?');
      assert.strictEqual(query.params[0], buf);
    });

  });

});
