var assert = require('chai').assert;
var Offset = require('../src/mysql/query/Offset');

describe('Offset', function () {

  describe('#fromQuery()', function () {

    it('throws error when $offset is Object', function () {
      assert.throws(function () { Offset.fromQuery({$offset: {}}); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is Boolean', function () {
      assert.throws(function () { Offset.fromQuery({$offset: true}); }, /invalid \$offset argument/i);
      assert.throws(function () { Offset.fromQuery({$offset: false}); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is String', function () {
      assert.throws(function () { Offset.fromQuery({$offset: ''}); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is Array', function () {
      assert.throws(function () { Offset.fromQuery({$offset: []}); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is null', function () {
      assert.throws(function () { Offset.fromQuery({$offset: null}); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is negative integer', function () {
      assert.throws(function () { Offset.fromQuery({$offset: -1}); }, /invalid \$offset argument/i);
    });

    it('throws error when $offset is float', function () {
      assert.throws(function () { Offset.fromQuery({$offset: 1.1234}); }, /invalid \$offset argument/i);
    });

    it('accepts undefined $offset', function () {
      var $offset = Offset.fromQuery({});
      assert.strictEqual($offset.value, null);
    });

    it('accepts positive integer as $offset', function () {
      var $offset = Offset.fromQuery({$offset: 10});
      assert.strictEqual($offset.value, 10);
    });

    it('accepts zero (0) as $offset', function () {
      var $offset = Offset.fromQuery({$offset: 0});
      assert.strictEqual($offset.value, 0);
    });

  });

});
