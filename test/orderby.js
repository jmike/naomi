var assert = require('chai').assert;
var OrderBy = require('../src/query/Orderby');

describe('OrderBy', function () {

  describe('#fromQuery()', function () {

    it('throws error when $orderby is Object', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: {}}); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby is Boolean', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: true}); }, /invalid \$orderby argument/i);
      assert.throws(function () { OrderBy.fromQuery({$orderby: false}); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby is String', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: ''}); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby is null', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: null}); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby is number', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: 123}); }, /invalid \$orderby argument/i);
    });

    it('throws error when $orderby contains number', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: [123]}); }, /invalid \$orderby element/i);
    });

    it('throws error when $orderby contains boolean', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: [true]}); }, /invalid \$orderby element/i);
      assert.throws(function () { OrderBy.fromQuery({$orderby: [false]}); }, /invalid \$orderby element/i);
    });

    it('throws error when $orderby contains empty object', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: [{}]}); }, /invalid \$orderby element/i);
    });

    it('throws error when $orderby contains object with > 1 elements', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: [{a: 1, b: 1}]}); }, /invalid \$orderby element/i);
    });

    it('throws error when $orderby contains object with invalid value', function () {
      assert.throws(function () { OrderBy.fromQuery({$orderby: [{a: 0}]}); }, /invalid \$orderby element/i);
      assert.throws(function () { OrderBy.fromQuery({$orderby: [{a: 2}]}); }, /invalid \$orderby element/i);
      assert.throws(function () { OrderBy.fromQuery({$orderby: [{a: -2}]}); }, /invalid \$orderby element/i);
    });

    it('accepts undefined $orderby', function () {
      var $orderby = OrderBy.fromQuery({});
      assert.isArray($orderby.value);
      assert.lengthOf($orderby.value, 0);
    });

    it('accepts empty $orderby', function () {
      var $orderby = OrderBy.fromQuery({$orderby: []});
      assert.isArray($orderby.value);
      assert.lengthOf($orderby.value, 0);
    });

    it('accepts string $orderby element', function () {
      var $orderby = OrderBy.fromQuery({$orderby: ['id']});
      assert.isArray($orderby.value);
      assert.lengthOf($orderby.value, 1);
      assert.deepEqual($orderby.value[0], {id: 1});
    });

    it('accepts object $orderby element', function () {
      var $orderby = OrderBy.fromQuery({$orderby: [{name: -1}]});
      assert.isArray($orderby.value);
      assert.lengthOf($orderby.value, 1);
      assert.deepEqual($orderby.value[0], {name: -1});
    });

    it('accepts mixture of string and object $orderby elements', function () {
      var $orderby = OrderBy.fromQuery({$orderby: ['id', {name: -1}]});
      assert.isArray($orderby.value);
      assert.lengthOf($orderby.value, 2);
      assert.deepEqual($orderby.value[0], {id: 1});
      assert.deepEqual($orderby.value[1], {name: -1});
    });

  });

});
