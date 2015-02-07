require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var Projection = require('../src/query/Projection');

describe('Projection', function () {

  describe('#fromQuery()', function () {

    it('throws error when $projection is Number', function () {
      assert.throws(function () { Projection.fromQuery({$projection: -1}); }, /invalid \$projection argument/i);
      assert.throws(function () { Projection.fromQuery({$projection: 0}); }, /invalid \$projection argument/i);
      assert.throws(function () { Projection.fromQuery({$projection: 1}); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is Boolean', function () {
      assert.throws(function () { Projection.fromQuery({$projection: true}); }, /invalid \$projection argument/i);
      assert.throws(function () { Projection.fromQuery({$projection: false}); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is String', function () {
      assert.throws(function () { Projection.fromQuery({$projection: ''}); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is Array', function () {
      assert.throws(function () { Projection.fromQuery({$projection: []}); }, /invalid \$projection argument/i);
    });

    it('throws error when $projection is null', function () {
      assert.throws(function () { Projection.fromQuery({$projection: null}); }, /invalid \$projection argument/i);
    });

    it('accepts empty $projection', function () {
      var $projection = Projection.fromQuery({});
      assert.isObject($projection);
      assert.isArray($projection.$include);
      assert.lengthOf($projection.$include, 0);
      assert.isArray($projection.$exclude);
      assert.lengthOf($projection.$exclude, 0);
    });

    it('accepts $projection with inclusive columns', function () {
      var $projection = Projection.fromQuery({$projection: {name: 1, age: 1}});
      assert.isObject($projection);
      assert.isArray($projection.$include);
      assert.sameMembers($projection.$include, ['name', 'age']);
      assert.isArray($projection.$exclude);
      assert.lengthOf($projection.$exclude, 0);
    });

    it('accepts $projection with exclusive columns', function () {
      var $projection = Projection.fromQuery({$projection: {id: 0}});
      assert.isObject($projection);
      assert.isArray($projection.$include);
      assert.lengthOf($projection.$include, 0);
      assert.isArray($projection.$exclude);
      assert.sameMembers($projection.$exclude, ['id']);
    });

    it('accepts a mixture of exclusive and inclusive columns', function () {
      var $projection = Projection.fromQuery({$projection: {id: 0, name: 1, age: 1}});
      assert.isArray($projection.$include);
      assert.sameMembers($projection.$include, ['name', 'age']);
      assert.isArray($projection.$exclude);
      assert.sameMembers($projection.$exclude, ['id']);
    });

  });

});
