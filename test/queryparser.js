require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var projection = require('../src/query/projection');
var limit = require('../src/query/limit');
var offset = require('../src/query/offset');
var orderby = require('../src/query/orderby');
var parser = require('../src/query/parser');

describe('projection#parse()', function () {

  it('throws error when $projection is Number', function () {
    assert.throws(function () { projection.parse(-1); }, /invalid \$projection argument/i);
    assert.throws(function () { projection.parse(0); }, /invalid \$projection argument/i);
    assert.throws(function () { projection.parse(1); }, /invalid \$projection argument/i);
  });

  it('throws error when $projection is Boolean', function () {
    assert.throws(function () { projection.parse(true); }, /invalid \$projection argument/i);
    assert.throws(function () { projection.parse(false); }, /invalid \$projection argument/i);
  });

  it('throws error when $projection is String', function () {
    assert.throws(function () { projection.parse(''); }, /invalid \$projection argument/i);
  });

  it('throws error when $projection is Array', function () {
    assert.throws(function () { projection.parse([]); }, /invalid \$projection argument/i);
  });

  it('throws error when $projection is null', function () {
    assert.throws(function () { projection.parse(null); }, /invalid \$projection argument/i);
  });

  it('accepts empty $projection', function () {
    var $projection = projection.parse();
    assert.isObject($projection);
    assert.isArray($projection.$include);
    assert.lengthOf($projection.$include, 0);
    assert.isArray($projection.$exclude);
    assert.lengthOf($projection.$exclude, 0);
  });

  it('accepts $projection with inclusive columns', function () {
    var $projection = projection.parse({name: 1, age: 1});
    assert.isObject($projection);
    assert.isArray($projection.$include);
    assert.sameMembers($projection.$include, ['name', 'age']);
    assert.isArray($projection.$exclude);
    assert.lengthOf($projection.$exclude, 0);
  });

  it('accepts $projection with exclusive columns', function () {
    var $projection = projection.parse({id: 0});
    assert.isObject($projection);
    assert.isArray($projection.$include);
    assert.lengthOf($projection.$include, 0);
    assert.isArray($projection.$exclude);
    assert.sameMembers($projection.$exclude, ['id']);
  });

  it('accepts a mixture of exclusive and inclusive columns', function () {
    var $projection = projection.parse({id: 0, name: 1, age: 1});
    assert.isObject($projection);
    assert.isArray($projection.$include);
    assert.sameMembers($projection.$include, ['name', 'age']);
    assert.isArray($projection.$exclude);
    assert.sameMembers($projection.$exclude, ['id']);
  });

});

describe('limit#parse()', function () {

  it('throws error when $limit is Object', function () {
    assert.throws(function () { limit.parse({}); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is Boolean', function () {
    assert.throws(function () { limit.parse(true); }, /invalid \$limit argument/i);
    assert.throws(function () { limit.parse(false); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is String', function () {
    assert.throws(function () { limit.parse(''); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is Array', function () {
    assert.throws(function () { limit.parse([]); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is null', function () {
    assert.throws(function () { limit.parse(null); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is negative integer', function () {
    assert.throws(function () { limit.parse(-1); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is float', function () {
    assert.throws(function () { limit.parse(1.1234); }, /invalid \$limit argument/i);
  });

  it('throws error when $limit is zero', function () {
    assert.throws(function () { limit.parse(0); }, /invalid \$limit argument/i);
  });

  it('accepts undefined $limit', function () {
    var $limit = limit.parse();
    assert.strictEqual($limit, null);
  });

  it('accepts positive integer as $limit', function () {
    var $limit = limit.parse(10);
    assert.strictEqual($limit, 10);
  });

});

describe('offset#parse()', function () {

  it('throws error when $offset is Object', function () {
    assert.throws(function () { offset.parse({}); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is Boolean', function () {
    assert.throws(function () { offset.parse(true); }, /invalid \$offset argument/i);
    assert.throws(function () { offset.parse(false); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is String', function () {
    assert.throws(function () { offset.parse(''); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is Array', function () {
    assert.throws(function () { offset.parse([]); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is null', function () {
    assert.throws(function () { offset.parse(null); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is negative integer', function () {
    assert.throws(function () { offset.parse(-1); }, /invalid \$offset argument/i);
  });

  it('throws error when $offset is float', function () {
    assert.throws(function () { offset.parse(1.1234); }, /invalid \$offset argument/i);
  });

  it('accepts undefined $offset', function () {
    var $offset = offset.parse();
    assert.strictEqual($offset, null);
  });

  it('accepts positive integer as $offset', function () {
    var $offset = offset.parse(10);
    assert.strictEqual($offset, 10);
  });

  it('accepts zero (0) as $offset', function () {
    var $offset = offset.parse(0);
    assert.strictEqual($offset, 0);
  });

});

describe('orderby#parse()', function () {

  it('throws error when $orderby is Object', function () {
    assert.throws(function () { orderby.parse({}); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby is Boolean', function () {
    assert.throws(function () { orderby.parse(true); }, /invalid \$orderby argument/i);
    assert.throws(function () { orderby.parse(false); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby is String', function () {
    assert.throws(function () { orderby.parse(''); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby is null', function () {
    assert.throws(function () { orderby.parse(null); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby is number', function () {
    assert.throws(function () { orderby.parse(123); }, /invalid \$orderby argument/i);
  });

  it('throws error when $orderby contains number', function () {
    assert.throws(function () { orderby.parse([123]); }, /invalid \$orderby element/i);
  });

  it('throws error when $orderby contains boolean', function () {
    assert.throws(function () { orderby.parse([true]); }, /invalid \$orderby element/i);
    assert.throws(function () { orderby.parse([false]); }, /invalid \$orderby element/i);
  });

  it('throws error when $orderby contains empty object', function () {
    assert.throws(function () { orderby.parse([{}]); }, /invalid \$orderby element/i);
  });

  it('throws error when $orderby contains object with > 1 elements', function () {
    assert.throws(function () { orderby.parse([{a: 1, b: 1}]); }, /invalid \$orderby element/i);
  });

  it('throws error when $orderby contains object with invalid value', function () {
    assert.throws(function () { orderby.parse([{a: 0}]); }, /invalid \$orderby element/i);
    assert.throws(function () { orderby.parse([{a: 2}]); }, /invalid \$orderby element/i);
    assert.throws(function () { orderby.parse([{a: -2}]); }, /invalid \$orderby element/i);
  });

  it('accepts undefined $orderby', function () {
    var $orderby = orderby.parse();
    assert.isArray($orderby);
    assert.lengthOf($orderby, 0);
  });

  it('accepts empty $orderby', function () {
    var $orderby = orderby.parse([]);
    assert.isArray($orderby);
    assert.lengthOf($orderby, 0);
  });

  it('accepts string $orderby element', function () {
    var $orderby = orderby.parse(['id']);
    assert.isArray($orderby);
    assert.lengthOf($orderby, 1);
    assert.deepEqual($orderby[0], {id: 1});
  });

  it('accepts object $orderby element', function () {
    var $orderby = orderby.parse([{name: -1}]);
    assert.isArray($orderby);
    assert.lengthOf($orderby, 1);
    assert.deepEqual($orderby[0], {name: -1});
  });

  it('accepts mixture of string and object $orderby elements', function () {
    var $orderby = orderby.parse(['id', {name: -1}]);
    assert.isArray($orderby);
    assert.lengthOf($orderby, 2);
    assert.deepEqual($orderby[0], {id: 1});
    assert.deepEqual($orderby[1], {name: -1});
  });

});

describe('parser#parse()', function () {

  it('accepts empty $query', function () {
    var $query = parser.parse();
    assert.isObject($query);
    assert.property($query, '$projection');
    assert.property($query, '$limit');
    assert.property($query, '$offset');
    assert.property($query, '$orderby');
    assert.property($query, '$filter');
  });

  it('successfully parses a valid $query', function () {
    var $query = parser.parse({
      id: {lte: 10},
      $projection: {
        id: 1,
        name: 0
      },
      $orderby: [{name: -1}, 'id'],
      $limit: 1,
      $offset: 1
    });
    assert.isObject($query);
    assert.deepEqual($query, {
      $projection: {
        $include: ['id'],
        $exclude: ['name']
      },
      $filter: {id: {lte: 10}},
      $orderby: [{name: -1}, {id: 1}],
      $limit: 1,
      $offset: 1
    });
  });

});
