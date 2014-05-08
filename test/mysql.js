var assert = require('chai').assert,
  async = require('async'),
  naomi = require('../src/naomi'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('MySQL Database', function () {

  describe('@DISCONNECTED', function () {

    describe('#query()', function () {

      it('should throw an error when sql is invalid', function () {
        assert.throws(function () {
          db.query();
        }, /sql/i);
        assert.throws(function () {
          db.query(1);
        }, /sql/i);
        assert.throws(function () {
          db.query(true);
        }, /sql/i);
        assert.throws(function () {
          db.query({});
        }, /sql/i);
        assert.throws(function () {
          db.query([]);
        }, /sql/i);
        assert.throws(function () {
          db.query(null);
        }, /sql/i);
      });

      it('should throw an error when params array is invalid', function () {
        assert.throws(function () {
          db.query('SELECT 1;', 1);
        }, /invalid query parameters/i);
        assert.throws(function () {
          db.query('SELECT 1;', true);
        }, /invalid query parameters/i);
        assert.throws(function () {
          db.query('SELECT 1;', 'foo');
        }, /invalid query parameters/i);
        assert.throws(function () {
          db.query('SELECT 1;', null);
        }, /invalid query parameters/i);
      });

      it('should throw an error when options is invalid', function () {
        assert.throws(function () {
          db.query('SELECT 1;', [], 1);
        }, /invalid query options/i);
        assert.throws(function () {
          db.query('SELECT 1;', [], true);
        }, /invalid query options/i);
        assert.throws(function () {
          db.query('SELECT 1;', [], 'foo');
        }, /invalid query options/i);
        assert.throws(function () {
          db.query('SELECT 1;', [], []);
        }, /invalid query options/i);
        assert.throws(function () {
          db.query('SELECT 1;', [], null);
        }, /invalid query options/i);
      });

      it('should throw an error when callback is invalid', function () {
        assert.throws(function () {
          db.query('SELECT 1;', [], {}, 1);
        }, /invalid callback/i);
        assert.throws(function () {
          db.query('SELECT 1;', [], {}, true);
        }, /invalid callback/i);
        assert.throws(function () {
          db.query('SELECT 1;', [], {}, 'foo');
        }, /invalid callback/i);
        assert.throws(function () {
          db.query('SELECT 1;', [], {}, []);
        }, /invalid callback/i);
        assert.throws(function () {
          db.query('SELECT 1;', [], {}, {});
        }, /invalid callback/i);
        assert.throws(function () {
          db.query('SELECT 1;', [], {}, null);
        }, /invalid callback/i);
      });

      it('should run the callback with connection error', function (done) {
        db.query('SELECT 1;', function (err) {
          assert.instanceOf(err, Error);
          assert.equal(err.message, 'Connection is closed - did you forget to call #connect()?');
          done();
        });
      });

    });

    describe('#extend()', function () {

      it('should throw an error when table name is invalid', function () {
        assert.throws(function () {
          db.extend();
        });
        assert.throws(function () {
          db.extend(1);
        });
        assert.throws(function () {
          db.extend(true);
        });
        assert.throws(function () {
          db.extend({});
        });
        assert.throws(function () {
          db.extend([]);
        });
        assert.throws(function () {
          db.extend(null);
        });
      });

    });

  });

  describe('@CONNECTED', function () {

    before(function (done) {
      db.connect(done);
    });

    after(function (done) {
      db.disconnect(done);
    });

    describe('#query()', function () {

      it('should only return records on plain SELECT', function (done) {
        db.query('SELECT 1;', function () {
          var error, records;

          assert.lengthOf(arguments, 2);

          error = arguments[0];
          records = arguments[1];

          assert.isNull(error);
          assert.isArray(records);
          assert.lengthOf(records, 1);
          assert.strictEqual(records[0]['1'], 1);

          done();
        });

        assert.throws(function () {
          db.query();
        });
        assert.throws(function () {
          db.query(1);
        });
        assert.throws(function () {
          db.query(true);
        });
        assert.throws(function () {
          db.query({});
        });
        assert.throws(function () {
          db.query([]);
        });
        assert.throws(function () {
          db.query(null);
        });
      });

    });

    describe('Collection "employees"', function () {

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

      it('should contain valid metadata', function (done) {
        db._loadMeta(function (err) {
          var meta;

          if (err) return done(err);

          meta = db.tables.employees;

          assert.isObject(meta);

          // assert columns
          assert.property(meta, 'columns');
          assert.isObject(meta.columns);

          assert.property(meta.columns, 'id');
          assert.isObject(meta.columns.id);
          assert.isFalse(meta.columns.id.isNullable);
          assert.isNull(meta.columns.id.comment);
          assert.strictEqual(meta.columns.id.position, 0);

          assert.property(meta.columns, 'firstName');
          assert.isObject(meta.columns.firstName);
          assert.isFalse(meta.columns.firstName.isNullable);
          assert.strictEqual(meta.columns.firstName.collation, 'utf8_general_ci');
          assert.isNull(meta.columns.firstName.comment);
          assert.strictEqual(meta.columns.firstName.position, 1);

          assert.property(meta.columns, 'lastName');
          assert.isObject(meta.columns.lastName);
          assert.isFalse(meta.columns.lastName.isNullable);
          assert.strictEqual(meta.columns.lastName.collation, 'utf8_general_ci');
          assert.isNull(meta.columns.lastName.comment);
          assert.strictEqual(meta.columns.lastName.position, 2);

          assert.property(meta.columns, 'age');
          assert.isObject(meta.columns.age);
          assert.isTrue(meta.columns.age.isNullable);
          assert.isNull(meta.columns.age.default);
          assert.isNull(meta.columns.age.comment);
          assert.strictEqual(meta.columns.age.position, 3);

          // assert indices
          assert.property(meta, 'primaryKey');
          assert.isArray(meta.primaryKey);
          assert.lengthOf(meta.primaryKey, 1);
          assert.strictEqual(meta.primaryKey[0], 'id');

          assert.property(meta, 'uniqueKeys');
          assert.isObject(meta.uniqueKeys);
          assert.property(meta.uniqueKeys, 'unique_idx');
          assert.isArray(meta.uniqueKeys.unique_idx);
          assert.lengthOf(meta.uniqueKeys.unique_idx, 2);
          assert.sameMembers(meta.uniqueKeys.unique_idx, ['firstName', 'lastName']);

          assert.property(meta, 'indexKeys');
          assert.isObject(meta.indexKeys);
          assert.property(meta.indexKeys, 'age_idx');
          assert.isArray(meta.indexKeys.age_idx);
          assert.lengthOf(meta.indexKeys.age_idx, 1);
          assert.strictEqual(meta.indexKeys.age_idx[0], 'age');

          done();
        });
      });

      it('should return true on #isPrimaryKey("id")', function (done) {
        db._loadMeta(function (err) {
          if (err) return done(err);

          assert.isTrue(employees.isPrimaryKey('id'));
          assert.isFalse(employees.isPrimaryKey('age'));
          assert.isFalse(employees.isPrimaryKey('invalid-column'));
          assert.isFalse(employees.isPrimaryKey());

          done();
        });
      });

      it('should return true on #isUniqueKey("firstName", "lastName")', function (done) {
        db._loadMeta(function (err) {
          if (err) return done(err);

          assert.isTrue(employees.isUniqueKey('firstName', 'lastName'));
          assert.isFalse(employees.isUniqueKey('age'));
          assert.isFalse(employees.isUniqueKey('invalid-column'));

          done();
        });
      });

      it('should return true on #isIndexKey("age")', function (done) {
        db._loadMeta(function (err) {
          if (err) return done(err);

          assert.isTrue(employees.isIndexKey('age'));
          assert.isFalse(employees.isIndexKey('age', 'firstName'));
          assert.isFalse(employees.isIndexKey('invalid-column'));

          done();
        });
      });

      it('should be able run a CRUD [+ Count] operation', function (done) {

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

      it('should return error on #get() when selector key is not column ', function (done) {
        employees.get({foo: 'bar'}, function (err) {
          assert.instanceOf(err, Error);
          assert.equal(err.message, 'Column "foo" could not be found in table "employees"');

          done();
        });
      });

      it('should return error on #count() when selector key is not column ', function (done) {
        employees.count({foo: 'bar'}, function (err) {
          assert.instanceOf(err, Error);
          assert.equal(err.message, 'Column "foo" could not be found in table "employees"');

          done();
        });
      });

      it('should return error on #del() when selector key is not column ', function (done) {
        employees.del({foo: 'bar'}, function (err) {
          assert.instanceOf(err, Error);
          assert.equal(err.message, 'Column "foo" could not be found in table "employees"');

          done();
        });
      });

    });

  });

  // describe('#_parseSelector()', function () {
  //
  //   it('should accept a Number as input', function () {
  //     var result = Collection.prototype._parseSelector(1);
  //
  //     assert.strictEqual(result.sql, '`id` = ?');
  //     assert.isArray(result.params);
  //     assert.strictEqual(result.params[0], 1);
  //   });
  //
  //   it('should accept a String as input', function () {
  //     var result = Collection.prototype._parseSelector('foo');
  //
  //     assert.strictEqual(result.sql, '`id` = ?');
  //     assert.isArray(result.params);
  //     assert.strictEqual(result.params[0], 'foo');
  //   });
  //
  //   it('should accept a Date as input', function () {
  //     var d = new Date(),
  //       result = Collection.prototype._parseSelector(d);
  //
  //     assert.strictEqual(result.sql, '`id` = ?');
  //     assert.isArray(result.params);
  //     assert.strictEqual(result.params[0], d);
  //   });
  //
  //   it('should accept a Boolean as input', function () {
  //     var result = Collection.prototype._parseSelector(true);
  //
  //     assert.strictEqual(result.sql, '`id` = ?');
  //     assert.isArray(result.params);
  //     assert.strictEqual(result.params[0], true);
  //   });
  //
  //   it('should accept an Object as input', function () {
  //     var result = Collection.prototype._parseSelector({a: 1, b: 'test'});
  //
  //     assert.strictEqual(result.sql, '`a` = ? AND `b` = ?');
  //     assert.isArray(result.params);
  //     assert.strictEqual(result.params[0], 1);
  //     assert.strictEqual(result.params[1], 'test');
  //   });
  //
  //   it('should accept an Array<Number> as input', function () {
  //     var result = Collection.prototype._parseSelector([1, 2, 3]);
  //
  //     assert.strictEqual(result.sql, '`id` = ? OR `id` = ? OR `id` = ?');
  //     assert.isArray(result.params);
  //     assert.strictEqual(result.params[0], 1);
  //     assert.strictEqual(result.params[1], 2);
  //     assert.strictEqual(result.params[2], 3);
  //   });
  //
  //   it('should accept Array<Object> as input', function () {
  //     var result = Collection.prototype._parseSelector([
  //       {a: 1, b: 2},
  //       {c: 3, d: 4}
  //     ]);
  //
  //     assert.strictEqual(result.sql, '`a` = ? AND `b` = ? OR `c` = ? AND `d` = ?');
  //     assert.isArray(result.params);
  //     assert.strictEqual(result.params[0], 1);
  //     assert.strictEqual(result.params[1], 2);
  //     assert.strictEqual(result.params[2], 3);
  //     assert.strictEqual(result.params[3], 4);
  //   });
  //
  // });

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

});
