var assert = require('chai').assert;
var GreaterThan = require('../src/mysql/query/GreaterThan');

describe('MySQL GreaterThan', function () {

  describe('constructor', function () {

    it('throws error when $gt is Object', function () {
      assert.throws(function () { new GreaterThan({}); }, /invalid \$gt argument/i);
    });

    it('throws error when $gt is Array', function () {
      assert.throws(function () { new GreaterThan([]); }, /invalid \$gt argument/i);
    });

    it('throws error when $gt is null', function () {
      assert.throws(function () { new GreaterThan(null); }, /invalid \$gt argument/i);
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

    it('returns valid SQL when $gt is boolean', function () {
      var d = new Date();
      var query = new GreaterThan(d).toParamSQL();
      assert.strictEqual(query.sql, '> ?');
      assert.strictEqual(query.params[0], d);
    });

    it('returns valid SQL when $gt is boolean', function () {
      var buf = new Buffer('abcde');
      var query = new GreaterThan(buf).toParamSQL();
      assert.strictEqual(query.sql, '> ?');
      assert.strictEqual(query.params[0], buf);
    });

  });

});
