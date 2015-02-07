var assert = require('chai').assert;
var Limit = require('../src/mysql/query/Limit');

describe('Limit', function () {

  describe('#fromQuery()', function () {

    it('throws error when $limit is Object', function () {
      assert.throws(function () { Limit.fromQuery({$limit: {}}); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is Boolean', function () {
      assert.throws(function () { Limit.fromQuery({$limit: true}); }, /invalid \$limit argument/i);
      assert.throws(function () { Limit.fromQuery({$limit: false}); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is String', function () {
      assert.throws(function () { Limit.fromQuery({$limit: ''}); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is Array', function () {
      assert.throws(function () { Limit.fromQuery({$limit: []}); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is null', function () {
      assert.throws(function () { Limit.fromQuery({$limit: null}); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is negative integer', function () {
      assert.throws(function () { Limit.fromQuery({$limit: -1}); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is float', function () {
      assert.throws(function () { Limit.fromQuery({$limit: 1.1234}); }, /invalid \$limit argument/i);
    });

    it('throws error when $limit is zero', function () {
      assert.throws(function () { Limit.fromQuery({$limit: 0}); }, /invalid \$limit argument/i);
    });

    it('accepts undefined $limit', function () {
      var $limit = Limit.fromQuery({});
      assert.strictEqual($limit.value, null);
    });

    it('accepts positive integer as $limit', function () {
      var $limit = Limit.fromQuery({$limit: 10});
      assert.strictEqual($limit.value, 10);
    });

  });

});
