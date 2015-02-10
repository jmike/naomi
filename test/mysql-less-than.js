var assert = require('chai').assert;
var LessThan = require('../src/mysql/query/LessThan');

describe('MySQL LessThan', function () {

  describe('constructor', function () {

    it('throws error when $lt is Object', function () {
      assert.throws(function () { new LessThan({}); }, /invalid \$lt argument/i);
    });

    it('throws error when $lt is Array', function () {
      assert.throws(function () { new LessThan([]); }, /invalid \$lt argument/i);
    });

    it('throws error when $lt is null', function () {
      assert.throws(function () { new LessThan(null); }, /invalid \$lt argument/i);
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $lt is string', function () {
      var query = new LessThan('string').toParamSQL();
      assert.strictEqual(query.sql, '< ?');
      assert.strictEqual(query.params[0], 'string');
    });

    it('returns valid SQL when $lt is number', function () {
      var query = new LessThan(123).toParamSQL();
      assert.strictEqual(query.sql, '< ?');
      assert.strictEqual(query.params[0], 123);
    });

    it('returns valid SQL when $lt is boolean', function () {
      var query = new LessThan(false).toParamSQL();
      assert.strictEqual(query.sql, '< ?');
      assert.strictEqual(query.params[0], false);
    });

    it('returns valid SQL when $lt is boolean', function () {
      var d = new Date();
      var query = new LessThan(d).toParamSQL();
      assert.strictEqual(query.sql, '< ?');
      assert.strictEqual(query.params[0], d);
    });

    it('returns valid SQL when $lt is boolean', function () {
      var buf = new Buffer('abcde');
      var query = new LessThan(buf).toParamSQL();
      assert.strictEqual(query.sql, '< ?');
      assert.strictEqual(query.params[0], buf);
    });

  });

});
