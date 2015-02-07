var assert = require('chai').assert;
var Values = require('../src/query/Values');

describe('Values', function () {

  describe('#fromQuery()', function () {

    it('throws error when $values is Boolean', function () {
      assert.throws(function () { Values.fromQuery(true); }, /invalid \$values argument/i);
      assert.throws(function () { Values.fromQuery(false); }, /invalid \$values argument/i);
    });

    it('throws error when $values is String', function () {
      assert.throws(function () { Values.fromQuery(''); }, /invalid \$values argument/i);
    });

    it('throws error when $values is null', function () {
      assert.throws(function () { Values.fromQuery(null); }, /invalid \$values argument/i);
    });

    it('throws error when $values is number', function () {
      assert.throws(function () { Values.fromQuery(123); }, /invalid \$values argument/i);
    });

    it('throws error when $values is empty Object', function () {
      assert.throws(function () { Values.fromQuery({}); }, /invalid \$values argument/i);
    });

    it('throws error when $values is empty Array', function () {
      assert.throws(function () { Values.fromQuery([]); }, /invalid \$values argument/i);
    });

    it('throws error when $values array contains number', function () {
      assert.throws(function () { Values.fromQuery([123]); }, /invalid \$values element/i);
    });

    it('throws error when $values array contains boolean', function () {
      assert.throws(function () { Values.fromQuery([true]); }, /invalid \$values element/i);
      assert.throws(function () { Values.fromQuery([false]); }, /invalid \$values element/i);
    });

    it('throws error when $values array contains empty object', function () {
      assert.throws(function () { Values.fromQuery([{}]); }, /invalid \$values element/i);
    });

    it('accepts undefined $values', function () {
      var $values = Values.fromQuery();
      assert.strictEqual($values.value, null);
    });

    it('accepts object as $values', function () {
      var $values = Values.fromQuery({id: 1, name: 'John', age: 20});
      assert.lengthOf($values.value, 1);
      assert.deepEqual($values.value[0], {id: 1, name: 'John', age: 20});
    });

    it('accepts array as $values', function () {
      var $values = Values.fromQuery([
        {id: 1, name: 'John', age: 20},
        {id: 2, name: 'Maria', age: 30}
      ]);
      assert.lengthOf($values.value, 2);
      assert.deepEqual($values.value[0], {id: 1, name: 'John', age: 20});
      assert.deepEqual($values.value[1], {id: 2, name: 'Maria', age: 30});
    });

  });

});
