var assert = require('chai').assert;
var Expression = require('../src/mysql/query/Expression');
var Id = require('../src/mysql/query/Expression.Id')(Expression);

describe('MySQL Id Expression', function () {

  describe('contructor', function () {

    it('throws error when $id is Array', function () {
      assert.throws(function () { new Id([]); }, /invalid \$id expression/i);
    });

    it('accepts null values', function () {
      assert.doesNotThrow(function () { new Id(null); });
    });

  });


});
