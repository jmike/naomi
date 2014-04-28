var assert = require('chai').assert,
  async = require('async'),
  naomi = require('../../src/naomi'),
  Collection = require('../../src/mysql/Collection'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('MySQL collection', function () {

  before(function (done) {
    db.connect(done);
  });

  after(function (done) {
    db.disconnect(done);
  });

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

  // describe('invalid table', function () {
  //
  //   var invalid;
  //
  //   // before(function (done) {
  //   //
  //   //   invalid = db.extend('invalid_table');
  //   //   done();
  //   // });
  //   //
  //   // it('should return null on #_getTableInfo()', function (done) {
  //   //   invalid._getTableInfo(function (err, info) {
  //   //     if (err) return done(err);
  //   //
  //   //     assert.isNull(info);
  //   //     done();
  //   //   });
  //   // });
  //
  //   it('should throw an error on #extend', function (done) {
  //     if (db.isConnected) {
  //       console.log('connected');
  //       assert.throws(function () {
  //         db.extend('invalid_table');
  //       });
  //
  //     } else {
  //       db.once('connect', function () {
  //         assert.throws(function () {
  //           db.extend('invalid_table');
  //         });
  //       });
  //     }
  //   });
  //
  // });

  describe('employees table', function () {

    var employees;

    before(function (done) {
      var sql = 'CREATE TABLE IF NOT EXISTS `employees` (' +
        '`id` int(10) unsigned NOT NULL AUTO_INCREMENT, ' +
        '`firstName` varchar(45) NOT NULL, ' +
        '`lastName` varchar(45) NOT NULL, ' +
        '`age` tinyint(3) unsigned DEFAULT NULL, ' +
        'PRIMARY KEY (`id`), ' +
        'UNIQUE KEY `unique_idx` (`firstName`,`lastName`), ' +
        'KEY `age_idx` (`age`)' +
        ') ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;';

      db.query(sql, function (error) {
        if (error) return done(error);

        employees = db.extend('employees');
        done();
      });
    });

    it('should return generic information on #_getTableInfo()', function (done) {
      employees._getTableInfo(function (err, info) {
        if (err) return done(err);

        assert.isObject(info);
        done();
      });
    });

    it('should be able run a CRUD + Count operation successfully', function (done) {

      async.series({

        create: function (callback) {
          employees.set({
            id: 1,
            firstName: 'James',
            lastName: 'Bond',
            age: 36
          }, callback);
        },

        read: function (callback) {
          employees.get(1, callback);
        },

        count: function (callback) {
          employees.count(callback);
        },

        update: function (callback) {
          employees.set({
            id: 1,
            firstName: 'James',
            lastName: 'Bond',
            age: 36
          }, callback);
        },

        delete: function (callback) {
          employees.del(1, callback);
        }

      }, function (error, result) {
        if (error) return done(error);

        assert.isObject(result.create);
        assert.strictEqual(result.create.insertId, 1);

        assert.isArray(result.read);
        assert.lengthOf(result.read, 1);

        assert.strictEqual(result.count, 1);

        assert.isObject(result.update);

        assert.isObject(result.delete);

        done();
      });
    });

  });

});
