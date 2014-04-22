var assert = require('chai').assert,
  naomi = require('../../src/naomi'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('MySQL Collection', function () {

  var collection = db.extend('table');

  it('should accept a Number as selector', function () {
    var result = collection._parseSelector(1);

    assert.strictEqual(result.sql, '`id` = ?');
    assert.isArray(result.params);
    assert.strictEqual(result.params[0], 1);
  });

  it('should accept a String as selector', function () {
    var result = collection._parseSelector('foo');

    assert.strictEqual(result.sql, '`id` = ?');
    assert.isArray(result.params);
    assert.strictEqual(result.params[0], 'foo');
  });

  it('should accept a Date as selector', function () {
    var d = new Date(),
      result = collection._parseSelector(d);

    assert.strictEqual(result.sql, '`id` = ?');
    assert.isArray(result.params);
    assert.strictEqual(result.params[0], d);
  });

  it('should accept a Boolean as selector', function () {
    var result = collection._parseSelector(true);

    assert.strictEqual(result.sql, '`id` = ?');
    assert.isArray(result.params);
    assert.strictEqual(result.params[0], true);
  });

  it('should accept an Object as selector', function () {
    var result = collection._parseSelector({a: 1, b: 'test'});

    assert.strictEqual(result.sql, '`a` = ? AND `b` = ?');
    assert.isArray(result.params);
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 'test');
  });

  it('should accept an Array<Number> as selector', function () {
    var result = collection._parseSelector([1, 2, 3]);

    assert.strictEqual(result.sql, '`id` = ? OR `id` = ? OR `id` = ?');
    assert.isArray(result.params);
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 2);
    assert.strictEqual(result.params[2], 3);
  });

  it('should accept an Array<Object> as selector', function () {
    var result = collection._parseSelector([{a: 1, b: 2}, {c: 3, d: 4}]);

    assert.strictEqual(result.sql, '`a` = ? AND `b` = ? OR `c` = ? AND `d` = ?');
    assert.isArray(result.params);
    assert.strictEqual(result.params[0], 1);
    assert.strictEqual(result.params[1], 2);
    assert.strictEqual(result.params[2], 3);
    assert.strictEqual(result.params[3], 4);
  });

});
