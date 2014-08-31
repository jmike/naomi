require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  assert = chai.assert;

describe('Postgres Table', function () {

  var db = naomi.create('postgres');

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

      it('returns true on #isPrimaryKey("id")', function () {
        assert.isTrue(employees.isPrimaryKey('id'));
        assert.isFalse(employees.isPrimaryKey('age'));
        assert.isFalse(employees.isPrimaryKey('invalid-column'));
        assert.isFalse(employees.isPrimaryKey());
      });

      it('returns true on #isUniqueKey("firstname", "lastname")', function () {
        assert.isTrue(employees.isUniqueKey('firstname', 'lastname'));
        assert.isFalse(employees.isUniqueKey('age'));
        assert.isFalse(employees.isUniqueKey('invalid-column'));
      });

      // it('returns true on #isIndexKey("age")', function () {
      //   assert.isTrue(employees.isIndexKey('age'));
      //   assert.isFalse(employees.isIndexKey('age', 'firstname'));
      //   assert.isFalse(employees.isIndexKey('invalid-column'));
      // });

      it('successfully completes a CRUD [+ Count] operation', function (done) {
        employees.setNew({ // insert
          firstname: 'Donnie',
          lastname: 'Azoff',
          age: 36
        })
        .then(function (records) { // select
          assert.isArray(records);
          assert.lengthOf(records, 1);
          assert.property(records[0], 'id');

          return employees.get(records[0].id);
        })
        .then(function (records) { // update
          assert.isArray(records);
          assert.lengthOf(records, 1);
          assert.property(records[0], 'id');

          return employees.set({
            firstname: 'Donnie',
            lastname: 'Azoff',
            age: 37
          });
        })
        .then(function (records) { // count
          assert.isArray(records);
          assert.lengthOf(records, 1);
          assert.property(records[0], 'id');

          return employees.count().then(function (n) {
            assert.operator(n, '>=', 1);
            return records;
          });
        })
        .then(function (records) { // delete
          assert.isArray(records);
          assert.lengthOf(records, 1);
          assert.property(records[0], 'id');

          return employees.del(records[0].id);
        })
        .then(function () {
          done();
        })
        .catch(function (err) {
          throw err;
        });
      });

      describe('#get()', function () {

        it('throws error when selector contains column that does not exist', function (done) {
          employees.get({foo: 'bar'}).catch(function (err) {
            assert.match(err, /invalid query selector/i);
            done();
          });
        });

      });

    });

    describe('companies', function () {

      var companies = db.extend('companies');

      it('returns true on #isPrimaryKey("id")', function () {
        assert.isTrue(companies.isPrimaryKey('id'));
      });

    });

  });

  // describe('@deferred', function () {

  //   describe('#get()', function () {

  //     var db = naomi.create('postgres');

  //     it('enqueues queries until db is ready', function (done) {
  //       var employees = db.extend('employees');
  //       employees.get(1).then(function (records) {
  //         assert.lengthOf(records, 1);
  //         db.disconnect(done);
  //       });

  //       db.connect();
  //     });

  //   });

  // });

});
