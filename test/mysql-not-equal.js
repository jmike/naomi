var assert = require('chai').assert;
var NotEqual = require('../src/mysql/query/NotEqual');

describe('MySQL NotEqual', function () {

  describe('constructor', function () {

    it('throws error when $ne is Object', function () {
      assert.throws(function () { new NotEqual({}); }, /invalid \$ne argument/i);
    });

    it('throws error when $ne is Array', function () {
      assert.throws(function () { new NotEqual([]); }, /invalid \$ne argument/i);
    });

    it('accepts null values', function () {
      assert.doesNotThrow(function () { new NotEqual(null); });
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $ne is null', function () {
      var query = new NotEqual(null).toParamSQL();
      assert.strictEqual(query.sql, 'IS NOT NULL');
      assert.lengthOf(query.params, 0);
    });

    it('returns valid SQL when $ne is string', function () {
      var query = new NotEqual('string').toParamSQL();
      assert.strictEqual(query.sql, '!= ?');
      assert.strictEqual(query.params[0], 'string');
    });

    it('returns valid SQL when $ne is number', function () {
      var query = new NotEqual(123).toParamSQL();
      assert.strictEqual(query.sql, '!= ?');
      assert.strictEqual(query.params[0], 123);
    });

    it('returns valid SQL when $ne is boolean', function () {
      var query = new NotEqual(false).toParamSQL();
      assert.strictEqual(query.sql, '!= ?');
      assert.strictEqual(query.params[0], false);
    });

    it('returns valid SQL when $ne is boolean', function () {
      var d = new Date();
      var query = new NotEqual(d).toParamSQL();
      assert.strictEqual(query.sql, '!= ?');
      assert.strictEqual(query.params[0], d);
    });

    it('returns valid SQL when $ne is boolean', function () {
      var buf = new Buffer('abcde');
      var query = new NotEqual(buf).toParamSQL();
      assert.strictEqual(query.sql, '!= ?');
      assert.strictEqual(query.params[0], buf);
    });

  });

});
