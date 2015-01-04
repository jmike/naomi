require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  assert = chai.assert;

describe('Postgres Table', function () {

  var db = naomi.create('postgres', {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
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

      // it('successfully completes a CRUD [+ Count] operation', function (done) {
      //   employees.add({
      //     firstname: 'Donnie',
      //     lastname: 'Azoff',
      //     age: 36
      //   })
      //   .then(function (key) {
      //     assert.isObject(key);
      //     assert.isNumber(key.id);

      //     return key;
      //   })
      //   .then(function (key) { // select
      //     return employees.get(key).then(function (records) {
      //       assert.isArray(records);
      //       assert.lengthOf(records, 1);
      //       assert.strictEqual(records[0].id, key.id);

      //       return key;
      //     });
      //   })
      //   .then(function (key) { // update (using primary key)
      //     return employees.set({
      //       id: key.id,
      //       firstname: 'Donnie',
      //       lastname: 'Azoff',
      //       age: 37
      //     }).then(function (k) {
      //       assert.deepEqual(k, key);

      //       return k;
      //     });
      //   })
      //   .then(function (key) { // update (using unique key)
      //     return employees.set({
      //       firstname: 'Donnie',
      //       lastname: 'Azoff',
      //       age: 38
      //     }).then(function (k) {
      //       assert.deepEqual(k, key);

      //       return k;
      //     });
      //   })
      //   .then(function (key) { // count
      //     return employees.count().then(function (n) {
      //       assert.operator(n, '>=', 1);
      //       return key;
      //     });
      //   })
      //   .then(function (k) {
      //     return employees.del(k);
      //   })
      //   .then(function () {
      //     done();
      //   })
      //   .catch(function (err) {
      //     throw err;
      //   });
      // });

      // describe('#get()', function () {

      //   it('throws error when selector contains column that does not exist', function (done) {
      //     employees.get({foo: 'bar'}).catch(function (err) {
      //       assert.match(err, /invalid query selector/i);
      //       done();
      //     });
      //   });

      // });

    });

    describe('companies', function () {

      var companies = db.extend('companies');

      before(function (done) {
        companies.once('ready', done);
      });

      it('returns true on #isPrimaryKey("id")', function () {
        assert.isTrue(companies.isPrimaryKey('id'));
      });

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
