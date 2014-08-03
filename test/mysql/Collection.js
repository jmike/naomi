// load environmental variables
require('dotenv').load();

var assert = require('chai').assert,
  naomi = require('../../src/naomi'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('MySQL:Collection', function () {

  describe('@connected', function () {

    before(function (done) {
      db.once('ready', done).connect();
    });

    after(function (done) {
      db.disconnect(done);
    });

    describe('regions', function () {

      var regions;

      before(function () {
        regions = db.extend('region');
      });

      it('should have valid primary key', function () {
        assert.isTrue(regions.isPrimaryKey('id'));
      });

    });

    describe('countries', function () {

      var countries;

      before(function () {
        countries = db.extend('country');
      });

      it('should have valid primary key', function () {
        assert.isTrue(countries.isPrimaryKey('id'));
      });

    });

    describe('employees', function () {

      var employees;

      before(function () {
        employees = db.extend('employee');
      });

      it('should have valid metadata', function () {
        var meta = db.getTableMeta('employee');

        assert.isObject(meta);

        // test columns
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

        assert.property(meta.columns, 'countryId');
        assert.isObject(meta.columns.countryId);
        assert.isFalse(meta.columns.countryId.isNullable);
        assert.isNull(meta.columns.countryId.default);
        assert.isNull(meta.columns.countryId.comment);
        assert.strictEqual(meta.columns.countryId.position, 4);

        // test indices
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
      });

      it('should return true on #isPrimaryKey("id")', function () {
        assert.isTrue(employees.isPrimaryKey('id'));
        assert.isFalse(employees.isPrimaryKey('age'));
        assert.isFalse(employees.isPrimaryKey('invalid-column'));
        assert.isFalse(employees.isPrimaryKey());
      });

      it('should return true on #isUniqueKey("firstName", "lastName")', function () {
        assert.isTrue(employees.isUniqueKey('firstName', 'lastName'));
        assert.isFalse(employees.isUniqueKey('age'));
        assert.isFalse(employees.isUniqueKey('invalid-column'));
      });

      it('should return true on #isIndexKey("age")', function () {
        assert.isTrue(employees.isIndexKey('age'));
        assert.isFalse(employees.isIndexKey('age', 'firstName'));
        assert.isFalse(employees.isIndexKey('invalid-column'));
      });

      it('should be able to run a CRUD [+ Count] operation', function (done) {
        employees.set({
          id: 2,
          firstName: 'Donnie',
          lastName: 'Azoff',
          age: 36,
          countryId: 1
        }).then(function (data) {
          assert.isObject(data);
          assert.strictEqual(data.insertId, 2);

          return employees.get(2);
        }).then(function (records) {
          assert.isArray(records);
          assert.lengthOf(records, 1);

          return employees.countAll();
        }).then(function (count) {
          assert.strictEqual(count, 2);

          return employees.set({
            id: 2,
            firstName: 'Donnie',
            lastName: 'Azoff',
            age: 37,
            countryId: 1
          });
        }).then(function (data) {
          assert.isObject(data);

          return employees.del(2);
        }).then(function (data) {
          assert.isObject(data);
          done();
        });
      });

      it('should return error on #get() when column does not exist', function (done) {
        employees.get({foo: 'bar'}, function (err) {
          assert.strictEqual(err, 'Column "foo" could not be found in table "employee"');
          done();
        });
      });

      it('should return error on #count() when column does not exist', function (done) {
        employees.count({foo: 'bar'}, function (err) {
          assert.strictEqual(err, 'Column "foo" could not be found in table "employee"');
          done();
        });
      });

      it('should return error on #del() when column does not exist', function (done) {
        employees.del({foo: 'bar'}, function (err) {
          assert.strictEqual(err, 'Column "foo" could not be found in table "employee"');
          done();
        });
      });

    });

    describe('companies collection', function () {

      var companies;

      before(function () {
        companies = db.extend('company');
      });

      it('should have valid primary key', function () {
        assert.isTrue(companies.isPrimaryKey('id'));
      });

    });

  });

  describe('companies collection', function () {

    var companies;

    before(function () {
      companies = db.extend('company');
    });

    it('should have valid primary key', function () {
      assert.isTrue(companies.isPrimaryKey('id'));
    });

  });

});
