require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  Database = require('../src/Database'),
  assert = chai.assert,
  db;

db = new Database({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_SCHEMA
});

describe('Postgres Table', function () {

  describe('@connected', function () {

    var db = naomi.create(conn);

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

      it('is able to complete a CRUD [+ Count] operation', function (done) {
        employees.set({ // insert
          id: 2,
          firstname: 'Donnie',
          lastname: 'Azoff',
          age: 36
        }).then(function (data) {
          // assert.isObject(data);
          return employees.get(2); // select

        }).then(function (records) {
          assert.isArray(records);
          assert.lengthOf(records, 1);
          return employees.countAll(); // count

        }).then(function (count) {
          assert.strictEqual(count, 2);
          return employees.set({ // update
            id: 2,
            firstname: 'Donnie',
            lastname: 'Azoff',
            age: 37
          });

        }).then(function (data) {
          // assert.isObject(data);
          return employees.del(2); // delete

        }).then(function (data) {
          // assert.isObject(data);
          done();

        }).catch(function (err) {
          throw err;
        });
      });

      describe('#get()', function () {

        it('throws an error when selector contains column that does not exist', function () {
          employees.get({foo: 'bar'}).catch(function (err) {
            assert.strictEqual(err, 'Invalid selector: column "foo" cannot not be found in table "employees"');
          });
        });

      });

      describe('#count()', function () {

        it('throws an error when selector contains column that does not exist', function () {
          employees.count({foo: 'bar'}).catch(function (err) {
            assert.strictEqual(err, 'Invalid selector: column "foo" cannot not be found in table "employees"');
          });
        });

      });

      describe('#del()', function () {

        it('throws an error when selector contains column that does not exist', function () {
          employees.del({foo: 'bar'}).catch(function (err) {
            assert.strictEqual(err, 'Invalid selector: column "foo" cannot not be found in table "employees"');
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

  describe('@deferred', function () {

    describe('#get()', function () {

      var db = naomi.create(conn);

      it('enqueues queries until db is ready', function (done) {
        var employees = db.extend('employees');
        employees.get(1).then(function (records) {
          assert.lengthOf(records, 1);
          db.disconnect(done);
        });

        db.connect();
      });

    });

  });

});
