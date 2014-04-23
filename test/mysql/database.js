var assert = require('chai').assert,
  naomi = require('../../src/naomi'),
  Database = require('../../src/mysql/Database');

describe('MySQL Database', function () {

  describe('#query()', function () {

    it('should throw an error when disconnected', function (done) {
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;'));

      Database.prototype.query('SELECT 1;', function (error) {
        assert.instanceOf(error, Error);
        done();
      });
    });

    it('should throw an error when params are invalid', function () {
      assert.throws(Database.prototype.query.bind(null));

      assert.throws(Database.prototype.query.bind(null, 1));
      assert.throws(Database.prototype.query.bind(null, true));
      assert.throws(Database.prototype.query.bind(null, {}));
      assert.throws(Database.prototype.query.bind(null, []));
      assert.throws(Database.prototype.query.bind(null, null));

      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', 1));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', true));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', 'foo'));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', {}));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', null));

      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], 1));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], true));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], 'foo'));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], []));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], null));

      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], {}, 1));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], {}, true));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], {}, 'foo'));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], {}, []));
      assert.throws(Database.prototype.query.bind(null, 'SELECT 1;', [], {}, null));
    });

  });

  describe('#extend()', function () {

    it('should throw an error when table is invalid', function () {
      assert.throws(Database.prototype.extend.bind(null, 1));
      assert.throws(Database.prototype.extend.bind(null, true));
      assert.throws(Database.prototype.extend.bind(null, {}));
      assert.throws(Database.prototype.extend.bind(null, []));
      assert.throws(Database.prototype.extend.bind(null, null));
    });

  });

});
