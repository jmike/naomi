require('dotenv').load(); // load environmental variables

var chai = require('chai');
var naomi = require('../../src/naomi');
var assert = chai.assert;

describe('MySQL Table', function () {

  var db = naomi.create('mysql', {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

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

      it('returns false on undefined', function () {
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

      it('throws error when $query contains column that does not exist', function (done) {
        employees.get({foo: 'bar'})
          .catch(function (err) {
            assert.match(err, /unknown column/i);
            done();
          });
      });

    });

    describe('#count()', function () {

      it('throws an error when $query contains column that does not exist', function (done) {
        employees.count({foo: 'bar'}).catch(function (err) {
          assert.match(err, /unknown column/i);
          done();
        });
      });

    });

    describe('#del()', function () {

      it('throws an error when $query contains column that does not exist', function (done) {
        employees.del({foo: 'bar'}).catch(function (err) {
          assert.match(err, /unknown column/i);
          done();
        });
      });

    });

    describe('Count + CRUD operation', function () {

      var pk, count;

      it('counts records', function (done) {
        employees.count()
          .then(function (n) {
            assert.isNumber(n);
            assert.operator(n, '>=', 1);
            count = n;
          })
          .then(done)
          .catch(done);
      });

      it('creates record', function (done) {
        employees.add({firstname: 'Donnie', lastname: 'Azoff', age: 36})
          .then(function (result) {
            assert.isObject(result);
            assert.isNumber(result.id);
            pk = result;
          })
          // count records to validate #add
          .then(function () {
            return employees.count();
          })
          .then(function (n) {
            assert.strictEqual(n, count + 1);
            count = n;
          })
          .then(done)
          .catch(done);
      });

      it('reads record (using primary key)', function (done) {
        employees.get(pk)
          .then(function (records) {
            assert.isArray(records);
            assert.lengthOf(records, 1);
            assert.strictEqual(records[0].id, pk.id);
          })
          .then(done)
          .catch(done);
      });

      it('updates record (using primary key)', function (done) {
        employees.set({id: pk.id, firstname: 'Donnie', lastname: 'Azoff', age: 37})
          .then(function (key) {
            assert.deepEqual(key, pk);
            return key;
          })
          // read employee to validate #update
          .then(function (key) {
            return employees.get(key);
          })
          .then(function (records) {
            assert.strictEqual(records[0].age, 37);
          })
          .then(done)
          .catch(done);
      });

      it('updates record (using unique key)', function (done) {
        employees.set({firstname: 'Donnie', lastname: 'Azoff', age: 38})
          .then(function (key) {
            assert.deepEqual(key, pk);
            return key;
          })
          // read employee to validate #update
          .then(function (key) {
            return employees.get(key);
          })
          .then(function (records) {
            assert.strictEqual(records[0].age, 38);
          })
          .then(done)
          .catch(done);
      });

      it('deletes record (using primary key)', function (done) {
        employees.del(pk)
          // count records to validate #del
          .then(function () {
            return employees.count();
          })
          .then(function (n) {
            assert.strictEqual(n, count - 1);
          })
          .then(done)
          .catch(done);
      });

    });

    describe('Multiple records CRUD operation', function () {

      var $values = [
        {firstname: 'Mr.', lastname: 'Doobs', age: 18},
        {firstname: 'George', lastname: 'Fudge', age: 19},
        {firstname: 'Jack', lastname: 'White', age: 20}
      ];

      var pk, count;

      it('counts records', function (done) {
        employees.count()
          .then(function (n) {
            assert.isNumber(n);
            assert.operator(n, '>=', 1);
            count = n;
          })
          .then(done)
          .catch(done);
      });

      it('creates records', function (done) {
        employees.add($values)
          .then(function (result) {
            assert.isArray(result);
            assert.lengthOf(result, 3);
            assert.isObject(result[0]);
            assert.property(result[0], 'id');
            pk = result;
          })
          // count records to validate #add
          .then(function () {
            return employees.count();
          })
          .then(function (n) {
            assert.strictEqual(n, count + 3);
            count = n;
          })
          .then(done)
          .catch(done);
      });

      it('updates records (using primary key)', function (done) {
        $values = $values.map(function (obj, i) {
          obj.id = pk[i].id;
          obj.age = 30;
          return obj;
        });

        employees.set($values)
          .then(function (key) {
            assert.deepEqual(key, pk);
            return key;
          })
          // read employee to validate #update
          .then(function (key) {
            return employees.get(key);
          })
          .then(function (records) {
            assert.deepEqual(records, $values);
          })
          .then(done)
          .catch(done);
      });

      it('deletes records (using primary key)', function (done) {
        employees.del(pk)
          // count records to validate #del
          .then(function () {
            return employees.count();
          })
          .then(function (n) {
            assert.strictEqual(n, count - 3);
          })
          .then(done)
          .catch(done);
      });

    });

    describe('Mix of existing and non-existing records CRUD operation', function () {

      var $values = [
        {firstname: 'Monsieur', lastname: 'Levanter', age: 20},
        {firstname: 'Miss', lastname: 'Goldie', age: 18},
        {firstname: 'Mister', lastname: 'White', age: 38}
      ];

      var pk, count;

      it('counts records', function (done) {
        employees.count()
          .then(function (n) {
            assert.isNumber(n);
            assert.operator(n, '>=', 1);
            count = n;
          })
          .then(done)
          .catch(done);
      });

      it('creates just one record', function (done) {
        employees.add($values[0])
          .then(function (result) {
            assert.isObject(result);
            assert.isNumber(result.id);
            $values[0].id = result.id;
          })
          // count records to validate #add
          .then(function () {
            return employees.count();
          })
          .then(function (n) {
            assert.strictEqual(n, count + 1);
            count = n;
          })
          .then(done)
          .catch(done);
      });

      it('updates existing and non-existing records at a single step', function (done) {
        employees.set($values)
          .then(function (key) {
            assert.isArray(key);
            assert.lengthOf(key, 3);
            assert.strictEqual(key[0].id, $values[0].id);
            pk = key;
          })
          // count records to validate #set
          .then(function () {
            return employees.count();
          })
          .then(function (n) {
            assert.strictEqual(n, count + 2);
            count = n;
          })
          .then(done)
          .catch(done);
      });

      it('deletes records (using primary key)', function (done) {
        employees.del(pk)
          // count records to validate #del
          .then(function () {
            return employees.count();
          })
          .then(function (n) {
            assert.strictEqual(n, count - 3);
          })
          .then(done)
          .catch(done);
      });

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
