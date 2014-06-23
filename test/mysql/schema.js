var assert = require('chai').assert,
  async = require('async'),
  naomi = require('../../src/naomi'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('MySQL schema', function () {

  before(function (done) {
    db.connect();
    db.once('ready', done);
  });

  after(function (done) {
    db.disconnect(done);
  });

  describe('regions collection', function () {

    var regions;

    before(function () {
      regions = db.extend('region');
    });

    it('should have valid primary key', function () {
      assert.isTrue(regions.isPrimaryKey('id'));
    });

  });

  describe('countries collection', function () {

    var countries;

    before(function () {
      countries = db.extend('country');
    });

    it('should have valid primary key', function () {
      assert.isTrue(countries.isPrimaryKey('id'));
    });

  });

  describe('employees collection', function () {

    var employees;

    before(function () {
      employees = db.extend('employee');
    });

    it('should have valid metadata', function () {
      var meta = db._tables.employee;

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

      assert.property(meta.columns, 'countryId');
      assert.isObject(meta.columns.countryId);
      assert.isFalse(meta.columns.countryId.isNullable);
      assert.isNull(meta.columns.countryId.default);
      assert.isNull(meta.columns.countryId.comment);
      assert.strictEqual(meta.columns.countryId.position, 4);

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

    it('should accept the use of operators in selector', function () {
      var result = employees._parseSelector({id: {'=': 1}});
      assert.match(result.sql, / = /);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({id: {'==': 1}});
      assert.match(result.sql, / = /);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({id: {'===': 1}});
      assert.match(result.sql, / = /);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({id: {'=': null}});
      assert.match(result.sql, /IS NULL/);
      assert.lengthOf(result.params, 0);

      result = employees._parseSelector({id: {'!=': 1}});
      assert.match(result.sql, /\!=/);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({id: {'!=': null}});
      assert.match(result.sql, /IS NOT NULL/);
      assert.lengthOf(result.params, 0);

      result = employees._parseSelector({id: {'!==': 1}});
      assert.match(result.sql, /\!=/);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({id: {'<>': 1}});
      assert.match(result.sql, /\!=/);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({id: {'<>': null}});
      assert.match(result.sql, /IS NOT NULL/);
      assert.lengthOf(result.params, 0);

      result = employees._parseSelector({id: {'>': 1}});
      assert.match(result.sql, / > /);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({id: {'>=': 1}});
      assert.match(result.sql, />=/);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({id: {'<': 1}});
      assert.match(result.sql, / < /);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({id: {'<=': 1}});
      assert.match(result.sql, /<=/);
      assert.strictEqual(result.params[0], 1);

      result = employees._parseSelector({firstName: {'~': '%ame%'}});
      assert.match(result.sql, /LIKE/);
      assert.strictEqual(result.params[0], '%ame%');

      assert.throws(function () {
        employees._parseSelector({id: {'invalid': 1}});
      });
    });

    it('should accept an order expression', function () {
      var result = employees._parseOrder('id');
      assert.strictEqual(result, '`id` ASC');

      result = employees._parseOrder({id: 'ASC'});
      assert.strictEqual(result, '`id` ASC');

      result = employees._parseOrder({id: 'DESC'});
      assert.strictEqual(result, '`id` DESC');

      result = employees._parseOrder([{age: 'DESC'}, 'id']);
      assert.strictEqual(result, '`age` DESC, `id` ASC');

      assert.throws(function () {
        employees._parseOrder({id: 'invalid'});
      });
    });

    it('should accept a limit expression', function () {
      assert.strictEqual(employees._parseLimit('1'), 1);
      assert.strictEqual(employees._parseLimit('10'), 10);
      assert.strictEqual(employees._parseLimit(20), 20);

      assert.throws(function () {
        employees._parseLimit('0');
      });

      assert.throws(function () {
        employees._parseLimit('-1');
      });
    });

    it('should accept offset expressions', function () {
      assert.strictEqual(employees._parseOffset('0'), 0);
      assert.strictEqual(employees._parseOffset('10'), 10);
      assert.strictEqual(employees._parseOffset(20), 20);

      assert.throws(function () {
        employees._parseOffset('-1');
      });
    });

    it('should be able to run a CRUD [+ Count] operation', function (done) {

      async.series({

        create: function (callback) {
          employees.set({
            id: 2,
            firstName: 'Donnie',
            lastName: 'Azoff',
            age: 36,
            countryId: 1
          }, callback);
        },

        read: function (callback) {
          employees.get(2, callback);
        },

        count: function (callback) {
          employees.count(callback);
        },

        companies: function (callback) {
          employees.getRelated('company', 1, callback);
        },

        update: function (callback) {
          employees.set({
            id: 2,
            firstName: 'Donnie',
            lastName: 'Azoff',
            age: 37,
            countryId: 1
          }, callback);
        },

        delete: function (callback) {
          employees.del(2, callback);
        }

      }, function (error, result) {
        if (error) return done(error);

        assert.isObject(result.create);
        assert.strictEqual(result.create.insertId, 2);
        assert.isArray(result.read);
        assert.lengthOf(result.read, 1);
        assert.isArray(result.companies);
        assert.lengthOf(result.companies, 1);
        assert.strictEqual(result.count, 2);
        assert.isObject(result.update);
        assert.isObject(result.delete);

        done();
      });
    });

    it('should return error on #get() when selector key is not column ', function (done) {
      employees.get({foo: 'bar'}, function (err) {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Column "foo" could not be found in table "employee"');

        done();
      });
    });

    it('should return error on #count() when selector key is not column ', function (done) {
      employees.count({foo: 'bar'}, function (err) {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Column "foo" could not be found in table "employee"');

        done();
      });
    });

    it('should return error on #del() when selector key is not column ', function (done) {
      employees.del({foo: 'bar'}, function (err) {
        assert.instanceOf(err, Error);
        assert.equal(err.message, 'Column "foo" could not be found in table "employee"');

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

  describe('companyEmployees collection', function () {

    var companyEmployees;

    before(function () {
      companyEmployees = db.extend('companyEmployee');
    });

    it('should be related with tables: "company" and "employee"', function () {
      assert.isObject(db._tables.companyEmployee.related);
      assert.lengthOf(Object.keys(db._tables.companyEmployee.related), 2);

      assert.property(db._tables.companyEmployee.related, 'company');
      assert.isObject(db._tables.companyEmployee.related.company);
      assert.propertyVal(db._tables.companyEmployee.related.company, 'id', 'companyId');

      assert.property(db._tables.company.related, 'companyEmployee');
      assert.isObject(db._tables.company.related.companyEmployee);
      assert.propertyVal(db._tables.company.related.companyEmployee, 'companyId', 'id');

      assert.property(db._tables.companyEmployee.related, 'employee');
      assert.isObject(db._tables.companyEmployee.related.employee);
      assert.propertyVal(db._tables.companyEmployee.related.employee, 'id', 'employeeId');

      assert.property(db._tables.employee.related, 'companyEmployee');
      assert.isObject(db._tables.employee.related.companyEmployee);
      assert.propertyVal(db._tables.employee.related.companyEmployee, 'employeeId', 'id');
    });

  });

  it('should return a valid path on #_calculatePath("employee", "company")', function () {
    var path = db._calculatePath('employee', 'company');

    assert.isArray(path);
    assert.strictEqual(path[0], 'employee');
    assert.strictEqual(path[1], 'companyEmployee');
    assert.strictEqual(path[2], 'company');
  });

  it('should return a valid path on #_calculatePath("employee", "country")', function () {
    var path = db._calculatePath('employee', 'country');

    assert.isArray(path);
    assert.strictEqual(path[0], 'employee');
    assert.strictEqual(path[1], 'country');
  });

  it('should return null on #_calculatePath("employee", "irrelevant")', function () {
    var path = db._calculatePath('employee', 'irrelevant');
    assert.isNull(path);
  });

});
