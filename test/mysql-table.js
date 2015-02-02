require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  assert = chai.assert;

describe('MySQL Table', function () {

  var db = naomi.create('mysql', {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  describe('@connected', function () {

    before(function (done) {
      db.connect(done);
    });

    after(function (done) {
      db.disconnect(done);
    });

    describe('employees', function () {

      var employees = db.extend('employees');

      before(function (done) {
        employees.once('ready', done);
      });

      it('has valid metadata', function () {
        // columns
        assert.isArray(employees.columns);
        assert.lengthOf(employees.columns, 4);
        assert.strictEqual(employees.columns[0].name, 'id');
        assert.strictEqual(employees.columns[1].name, 'firstname');
        assert.strictEqual(employees.columns[2].name, 'lastname');
        assert.strictEqual(employees.columns[3].name, 'age');
        // primary key
        assert.isArray(employees.primaryKey);
        assert.lengthOf(employees.primaryKey, 1);
        assert.strictEqual(employees.primaryKey[0], 'id');
        // unique keys
        assert.isObject(employees.uniqueKeys);
        assert.property(employees.uniqueKeys, 'unique_idx');
        assert.isArray(employees.uniqueKeys.unique_idx);
        assert.sameMembers(employees.uniqueKeys.unique_idx, ['firstname', 'lastname']);
        // index keys
        assert.isObject(employees.indexKeys);
        assert.property(employees.indexKeys, 'age_idx');
        assert.lengthOf(employees.indexKeys.age_idx, 1);
        assert.sameMembers(employees.indexKeys.age_idx, ['age']);
      });

      describe('#isPrimaryKey()', function () {

        it('returns true on "id"', function () {
          assert.isTrue(employees.isPrimaryKey('id'));
        });

        it('returns false on "age"', function () {
          assert.isFalse(employees.isPrimaryKey('age'));
        });

        it('returns false on "invalid-column"', function () {
          assert.isFalse(employees.isPrimaryKey('invalid-column'));
        });

        it('returns false on empty string', function () {
          assert.isFalse(employees.isPrimaryKey());
        });

      });

      describe('#isUniqueKey()', function () {

        it('returns true on "firstname" + "lastname"', function () {
          assert.isTrue(employees.isUniqueKey('firstname', 'lastname'));
        });

        it('returns false on "age"', function () {
          assert.isFalse(employees.isUniqueKey('age'));
        });

        it('returns false on "invalid-column"', function () {
          assert.isFalse(employees.isUniqueKey('invalid-column'));
        });

        it('returns false on "firstname" + "lastname" + "age"', function () {
          assert.isFalse(employees.isUniqueKey('firstname', 'lastname', 'age'));
        });

        it('returns false on empty string', function () {
          assert.isFalse(employees.isUniqueKey());
        });

      });

      describe('#isIndexKey()', function () {

        it('returns true on "age"', function () {
          assert.isTrue(employees.isIndexKey('age'));
        });

        it('returns false on "age" + "firstname"', function () {
          assert.isFalse(employees.isIndexKey('age', 'firstname'));
        });

        it('returns false on "invalid-column"', function () {
          assert.isFalse(employees.isIndexKey('invalid-column'));
        });

        it('returns false on "id"', function () {
          assert.isFalse(employees.isIndexKey('id'));
        });

        it('returns false on empty string', function () {
          assert.isFalse(employees.isIndexKey());
        });

      });

      // describe('#get()', function () {

      //   it('throws error when selector contains column that does not exist', function (done) {
      //     employees.get({foo: 'bar'})
      //       .catch(function (err) {
      //         assert.match(err, /invalid query selector/i);
      //         done();
      //       });
      //   });

      // });

      // describe('#count()', function () {

      //   it('throws an error when selector contains column that does not exist', function (done) {
      //     employees.count({foo: 'bar'}).catch(function (err) {
      //       assert.match(err, /invalid query selector/i);
      //       done();
      //     });
      //   });

      // });

      // describe('#del()', function () {

      //   it('throws an error when selector contains column that does not exist', function (done) {
      //     employees.count({foo: 'bar'})
      //       .catch(function (err) {
      //         assert.match(err, /invalid query selector/i);
      //         done();
      //       });
      //   });

      // });
      //

      it('successfully completes a CRUD [+ Count] operation', function (done) {
        // create employee
        employees.add({firstname: 'Donnie', lastname: 'Azoff', age: 36})
          // validate key
          .then(function (key) {
            assert.isObject(key);
            assert.isNumber(key.id);
            return key;
          })
          // read employee using key
          .then(function (key) {
            return employees.get(key)
              .then(function (records) {
                assert.isArray(records);
                assert.lengthOf(records, 1);
                assert.strictEqual(records[0].id, key.id);
              })
              .return(key);
          })
          // update employee using primary key
          .then(function (key) {
            return employees.set({id: key.id, firstname: 'Donnie', lastname: 'Azoff', age: 37})
              .then(function (newkey) {
                assert.deepEqual(newkey, key);
                return newkey;
              });
          })
          // read employee to validate age
          .then(function (key) {
            return employees.get(key)
              .then(function (records) {
                assert.strictEqual(records[0].age, 37);
              })
              .return(key);
          })
          // update employee using unique key
          .then(function (key) {
            return employees.set({firstname: 'Donnie', lastname: 'Azoff', age: 38})
              .then(function (newkey) {
                assert.deepEqual(newkey, key);
                return newkey;
              });
          })
          // read employee to validate age
          .then(function (key) {
            return employees.get(key)
              .then(function (records) {
                assert.strictEqual(records[0].age, 38);
              })
              .return(key);
          })
          // count number of employees
          .then(function (key) {
            return employees.count()
              .then(function (n) {
                assert.operator(n, '>=', 1);
              })
              .return(key);
          })
          // delete employee
          .then(function (k) {
            return employees.del(k);
          })
          .catch(function (err) {
            throw err;
          })
          .finally(function () {
            done();
          });
      });

      // it('handles multiple records', function (done) {
      //   employees.add([
      //     {firstname: 'Mr.', lastname: 'Doobs', age: 18},
      //     {firstname: 'George', lastname: 'Fudge', age: 19},
      //     {firstname: 'Jack', lastname: 'White', age: 20}
      //   ])
      //     .then(function (result) {
      //       assert.isArray(result);
      //       assert.lengthOf(result, 3);
      //       assert.isObject(result[0]);
      //       assert.property(result[0], 'id');
      //       return result;
      //     })
      //     .then(function (result) { // update using primary key
      //       var records = result.map(function (obj) {
      //         obj.age = 40;
      //         obj.firstname = 'a';
      //         obj.lastname = 'b' + obj.id;
      //         return obj;
      //       });

      //       return employees.set(records)
      //         .then(function (pk) {
      //           assert.isArray(pk);
      //           assert.lengthOf(pk, 3);
      //           assert.isObject(pk[0]);
      //           assert.strictEqual(pk[0].id, result[0].id);
      //           assert.strictEqual(pk[1].id, result[1].id);
      //           assert.strictEqual(pk[2].id, result[2].id);
      //           return pk;
      //         });
      //     })
      //     .then(function (pk) {
      //       return employees.del(pk);
      //     })
      //     .catch(function (err) {
      //       throw err;
      //     })
      //     .finally(function () {
      //       done();
      //     });
      // });

      // it('sets existing and non-existing records at the same time', function (done) {
      //   employees.add({firstname: 'Mister', lastname: 'White', age: 18})
      //     .then(function (result) {
      //       return employees.set([
      //         {firstname: 'Monsieur', lastname: 'Levanter', age: 20},
      //         {firstname: 'Miss', lastname: 'Goldie', age: 18},
      //         {id: result.id, firstname: 'Mister', lastname: 'White', age: 38}
      //       ])
      //       .then(function (pk) { // update using primary key
      //         assert.isArray(pk);
      //         assert.lengthOf(pk, 3);
      //         assert.isObject(pk[0]);
      //         assert.strictEqual(pk[2].id, result.id);
      //         return pk;
      //       });
      //     })
      //     .then(function (pk) {
      //       return employees.del(pk);
      //     })
      //     .catch(function (err) {
      //       throw err;
      //     })
      //     .finally(function () {
      //       done();
      //     });
      // });

    });

    describe('invalid-table', function () {

      it('emits error after instantiation', function (done) {
        var table = db.extend('invalid-table');

        table.once('error', function (err) {
          assert.strictEqual(err.message, 'Table "invalid-table" does not exist in database');
          done();
        });
      });

    });

  });

});
