var assert = require('chai').assert;
var Filter = require('../src/mysql/query/Filter');

describe('Filter', function () {

  describe('#fromQuery()', function () {

    it('accepts empty object', function () {
      var $filter = Filter.fromQuery();
      assert.deepEqual($filter.value, null);
    });

    it('accepts object with multiple properties', function () {
      var $filter = Filter.fromQuery({id: 1, name: 'Jim'});
      assert.deepEqual($filter.value, {$and: [{id: 1}, {name: 'Jim'}]});
    });

    it('accepts array', function () {
      var $filter = Filter.fromQuery([{id: 1}, {id: 2}]);
      assert.deepEqual($filter.value, {$or: [{id: 1}, {id: 2}]});
    });

    it('accepts Number', function () {
      var $filter = Filter.fromQuery(123);
      assert.deepEqual($filter.value, {$primarykey: 123});
    });

    it('accepts String', function () {
      var $filter = Filter.fromQuery('string');
      assert.deepEqual($filter.value, {$primarykey: 'string'});
    });

    it('accepts Boolean', function () {
      var $filter = Filter.fromQuery(true);
      assert.deepEqual($filter.value, {$primarykey: true});
    });

    it('accepts Date', function () {
      var d = new Date();
      var $filter = Filter.fromQuery(d);
      assert.deepEqual($filter.value, {$primarykey: d});
    });

  });

});
