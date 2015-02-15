var assert = require('chai').assert;
var Expression = require('../src/mysql/query/Expression');
var Equal = require('../src/mysql/query/Expression.Equal')(Expression);

describe('MySQL Equal Expression', function () {

  describe('constructor', function () {

    it('throws error when $eq is Array', function () {
      assert.throws(function () { new Equal([]); }, /invalid \$eq expression/i);
    });

    it('accepts null values', function () {
      assert.doesNotThrow(function () { new Equal(null); });
    });

  });

  describe('#toParamSQL', function () {

    it('returns valid SQL when $eq is null', function () {
      var query = new Equal(null).toParamSQL();
      assert.strictEqual(query.sql, 'IS NULL');
      assert.lengthOf(query.params, 0);
    });

    it('returns valid SQL when $eq is string', function () {
      var query = new Equal('string').toParamSQL();
      assert.strictEqual(query.sql, '= ?');
      assert.strictEqual(query.params[0], 'string');
    });

    it('returns valid SQL when $eq is number', function () {
      var query = new Equal(123).toParamSQL();
      assert.strictEqual(query.sql, '= ?');
      assert.strictEqual(query.params[0], 123);
    });

    it('returns valid SQL when $eq is boolean', function () {
      var query = new Equal(false).toParamSQL();
      assert.strictEqual(query.sql, '= ?');
      assert.strictEqual(query.params[0], false);
    });

    it('returns valid SQL when $eq is date', function () {
      var d = new Date();
      var query = new Equal(d).toParamSQL();
      assert.strictEqual(query.sql, '= ?');
      assert.strictEqual(query.params[0], d);
    });

    it('returns valid SQL when $eq is buffer', function () {
      var buf = new Buffer('abcde');
      var query = new Equal(buf).toParamSQL();
      assert.strictEqual(query.sql, '= ?');
      assert.strictEqual(query.params[0], buf);
    });

  });

});
