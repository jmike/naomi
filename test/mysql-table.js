require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  assert = chai.assert;

describe('Postgres Table', function () {

  var db = naomi.create('mysql', {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  describe('@connected', function () {

    before(function (done) {
      db.once('ready', done);
      db.connect();
    });

    after(function (done) {
      db.disconnect(done);
    });

    describe('employees', function () {

      var employees = db.extend('employees');

      describe('#_getColumns()', function () {

        it('returns valid columns', function (done) {
          employees._getColumns(function (err, columns) {
            if (err) return done(err);
            assert.isArray(columns);
            assert.lengthOf(columns, 4);
            assert.isObject(columns[0]);
            assert.strictEqual(columns[0].name, 'id');
            assert.isObject(columns[1]);
            assert.strictEqual(columns[1].name, 'firstname');
            assert.isObject(columns[2]);
            assert.strictEqual(columns[2].name, 'lastname');
            assert.isObject(columns[3]);
            assert.strictEqual(columns[3].name, 'age');
            done();
          });
        });

      });

      describe('#_getForeignKeys()', function () {

        it('returns valid foreign keys', function (done) {
          employees._getForeignKeys(function (err, foreignKeys) {
            if (err) return done(err);
            assert.isArray(foreignKeys);
            assert.lengthOf(foreignKeys, 1);
            assert.isObject(foreignKeys[0]);
            assert.strictEqual(foreignKeys[0].key, 'fk_companyEmployee_employee');
            done();
          });
        });

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

      describe('#get()', function () {

        it('throws error when selector contains column that does not exist', function (done) {
          employees.get({foo: 'bar'})
            .catch(function (err) {
              assert.match(err, /invalid query selector/i);
              done();
            });
        });

      });

      describe('#count()', function () {

        it('throws an error when selector contains column that does not exist', function (done) {
          employees.count({foo: 'bar'}).catch(function (err) {
            assert.match(err, /invalid query selector/i);
            done();
          });
        });

      });

      describe('#del()', function () {

        it('throws an error when selector contains column that does not exist', function (done) {
          employees.count({foo: 'bar'})
            .catch(function (err) {
              assert.match(err, /invalid query selector/i);
              done();
            });
        });

      });

      it('successfully completes a CRUD [+ Count] operation', function (done) {
        employees.add({
          firstname: 'Donnie',
          lastname: 'Azoff',
          age: 36
        })
          .then(function (key) {
            assert.isObject(key);
            assert.isNumber(key.id);
            return key;
          })
          .then(function (key) { // select
            return employees.get(key).then(function (records) {
              assert.isArray(records);
              assert.lengthOf(records, 1);
              assert.strictEqual(records[0].id, key.id);
              return key;
            });
          })
          .then(function (key) { // update (using primary key)
            return employees.set({
              id: key.id,
              firstname: 'Donnie',
              lastname: 'Azoff',
              age: 37
            })
              .then(function (k) {
                assert.deepEqual(k, key);
                return k;
              });
          })
          .then(function (key) { // update (using unique key)
            return employees.set({
              firstname: 'Donnie',
              lastname: 'Azoff',
              age: 38
            })
              .then(function (k) {
                assert.deepEqual(k, key);
                return k;
              });
          })
          .then(function (key) { // count
            return employees.count().then(function (n) {
              assert.operator(n, '>=', 1);
              return key;
            });
          })
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

      it('handles multiple records', function (done) {
        employees.add([
          {firstname: 'John', lastname: 'Doobs', age: 18},
          {firstname: 'George', lastname: 'Fudge', age: 19},
          {firstname: 'Jack', lastname: 'White', age: 20}
        ])
          .then(function (result) {
            assert.isArray(result);
            assert.lengthOf(result, 3);
            assert.isObject(result[0]);
            assert.property(result[0], 'id');
            return result;
          })
          .then(function (result) { // update using primary key
            var records = result.map(function (obj) {
              obj.age = 40;
              obj.firstname = 'a';
              obj.lastname = 'b' + obj.id;
              return obj;
            });

            return employees.set(records)
              .then(function (pk) {
                assert.isArray(pk);
                assert.lengthOf(pk, 3);
                assert.isObject(pk[0]);
                assert.strictEqual(pk[0].id, result[0].id);
                assert.strictEqual(pk[1].id, result[1].id);
                assert.strictEqual(pk[2].id, result[2].id);
                return pk;
              });
          })
          .then(function (pk) {
            return employees.del(pk);
          })
          .catch(function (err) {
            throw err;
          })
          .finally(function () {
            done();
          });
      });

      it('sets existing and non-existing records at the same time', function (done) {
        employees.add({firstname: 'Mister', lastname: 'White', age: 18})
          .then(function (result) {
            return employees.set([
              {firstname: 'Monsieur', lastname: 'Levanter', age: 20},
              {firstname: 'Miss', lastname: 'Goldie', age: 18},
              {id: result.id, firstname: 'Mister', lastname: 'White', age: 38}
            ])
            .then(function (pk) { // update using primary key
              assert.isArray(pk);
              assert.lengthOf(pk, 3);
              assert.isObject(pk[0]);
              assert.strictEqual(pk[2].id, result.id);
              return pk;
            });
          })
          .then(function (pk) {
            return employees.del(pk);
          })
          .catch(function (err) {
            throw err;
          })
          .finally(function () {
            done();
          });
      });

    });

  });

});
