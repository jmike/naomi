var assert = require('chai').assert,
  naomi = require('../../src/naomi'),
  Collection = require('../../src/mysql/Collection');

describe('MySQL Collection', function () {

  describe('#_parseSelector()', function () {

    it('should accept a Number as input', function () {
      var result = Collection.prototype._parseSelector(1);

      assert.strictEqual(result.sql, '`id` = ?');
      assert.isArray(result.params);
      assert.strictEqual(result.params[0], 1);
    });

    it('should accept a String as input', function () {
      var result = Collection.prototype._parseSelector('foo');

      assert.strictEqual(result.sql, '`id` = ?');
      assert.isArray(result.params);
      assert.strictEqual(result.params[0], 'foo');
    });

    it('should accept a Date as input', function () {
      var d = new Date(),
        result = Collection.prototype._parseSelector(d);

      assert.strictEqual(result.sql, '`id` = ?');
      assert.isArray(result.params);
      assert.strictEqual(result.params[0], d);
    });

    it('should accept a Boolean as input', function () {
      var result = Collection.prototype._parseSelector(true);

      assert.strictEqual(result.sql, '`id` = ?');
      assert.isArray(result.params);
      assert.strictEqual(result.params[0], true);
    });

    it('should accept an Object as input', function () {
      var result = Collection.prototype._parseSelector({a: 1, b: 'test'});

      assert.strictEqual(result.sql, '`a` = ? AND `b` = ?');
      assert.isArray(result.params);
      assert.strictEqual(result.params[0], 1);
      assert.strictEqual(result.params[1], 'test');
    });

    it('should accept an Array<Number> as input', function () {
      var result = Collection.prototype._parseSelector([1, 2, 3]);

      assert.strictEqual(result.sql, '`id` = ? OR `id` = ? OR `id` = ?');
      assert.isArray(result.params);
      assert.strictEqual(result.params[0], 1);
      assert.strictEqual(result.params[1], 2);
      assert.strictEqual(result.params[2], 3);
    });

    it('should accept Array<Object> as input', function () {
      var result = Collection.prototype._parseSelector([
        {a: 1, b: 2},
        {c: 3, d: 4}
      ]);

      assert.strictEqual(result.sql, '`a` = ? AND `b` = ? OR `c` = ? AND `d` = ?');
      assert.isArray(result.params);
      assert.strictEqual(result.params[0], 1);
      assert.strictEqual(result.params[1], 2);
      assert.strictEqual(result.params[2], 3);
      assert.strictEqual(result.params[3], 4);
    });

  });

});
