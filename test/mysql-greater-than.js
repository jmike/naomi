var assert = require('chai').assert;
var Expression = require('../src/mysql/query/Expression');
var GreaterThan = require('../src/mysql/query/Expression.GreaterThan')(Expression);

describe('MySQL GreaterThan Expression', function () {

  describe('constructor', function () {

    it('throws error when $gt is Array', function () {
      assert.throws(function () { new GreaterThan([]); }, /invalid \$gt expression/i);
    });

    it('throws error when $gt is null', function () {
      assert.throws(function () { new GreaterThan(null); }, /invalid \$gt expression/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $gt is string', function () {
      var query = new GreaterThan('string').toParamSQL();
      assert.strictEqual(query.sql, '> ?');
      assert.strictEqual(query.params[0], 'string');
    });

    it('returns valid SQL when $gt is number', function () {
      var query = new GreaterThan(123).toParamSQL();
      assert.strictEqual(query.sql, '> ?');
      assert.strictEqual(query.params[0], 123);
    });

    it('returns valid SQL when $gt is boolean', function () {
      var query = new GreaterThan(false).toParamSQL();
      assert.strictEqual(query.sql, '> ?');
      assert.strictEqual(query.params[0], false);
    });

    it('returns valid SQL when $gt is date', function () {
      var d = new Date();
      var query = new GreaterThan(d).toParamSQL();
      assert.strictEqual(query.sql, '> ?');
      assert.strictEqual(query.params[0], d);
    });

    it('returns valid SQL when $gt is buffer', function () {
      var buf = new Buffer('abcde');
      var query = new GreaterThan(buf).toParamSQL();
      assert.strictEqual(query.sql, '> ?');
      assert.strictEqual(query.params[0], buf);
    });

  });

});
