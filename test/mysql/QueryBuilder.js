// load environmental variables
require('dotenv').load();

var assert = require('chai').assert,
  naomi = require('../../src/naomi'),
  QueryBuilder = require('../../src/mysql/QueryBuilder'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('MySQL:QueryBuilder', function () {

  before(function (done) {
    db.connect();
    db.once('ready', done);
  });

  after(function (done) {
    db.disconnect(done);
  });

  describe('@single table collection', function () {

    var employees;

    before(function () {
      employees = db.extend('employee');
    });

    describe('#compileSelectSQL', function () {

      it('should accept a null selector', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null);

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee`;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should accept an Integer selector', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, 1);

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `id` = ?;');
        assert.lengthOf(stmt.params, 1);
        assert.strictEqual(stmt.params[0], 1);
      });

      it('should accept a Float selector', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, 1.056);

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `id` = ?;');
        assert.lengthOf(stmt.params, 1);
        assert.strictEqual(stmt.params[0], 1.056);
      });

      it('should accept a Boolean selector', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, true);

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `id` = ?;');
        assert.lengthOf(stmt.params, 1);
        assert.strictEqual(stmt.params[0], true);
      });

      it('should accept a Date selector', function () {
        var date = new Date(),
          stmt = QueryBuilder.compileSelectSQL(employees, date);

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `id` = ?;');
        assert.lengthOf(stmt.params, 1);
        assert.strictEqual(stmt.params[0], date);
      });

      it('should accept a String selector', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, 'abc');

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `id` = ?;');
        assert.lengthOf(stmt.params, 1);
        assert.strictEqual(stmt.params[0], 'abc');
      });

      it('should accept an Object selector', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, {
          firstName: 'James',
          age: {'>': 23}
        });

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `firstName` = ? AND `age` > ?;');
        assert.lengthOf(stmt.params, 2);
        assert.strictEqual(stmt.params[0], 'James');
        assert.strictEqual(stmt.params[1], 23);
      });

      it('should accept an Array<Number> selector', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, [1, 2]);

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `id` = ? OR `id` = ?;');
        assert.lengthOf(stmt.params, 2);
        assert.strictEqual(stmt.params[0], 1);
        assert.strictEqual(stmt.params[1], 2);
      });

      it('should accept an Array<Object> selector', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, [1, {age: {'>': 18}}]);

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `id` = ? OR `age` > ?;');
        assert.lengthOf(stmt.params, 2);
        assert.strictEqual(stmt.params[0], 1);
        assert.strictEqual(stmt.params[1], 18);
      });

      it('should accept a zero (0) selector, even though is falsy', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, true);

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `id` = ?;');
        assert.lengthOf(stmt.params, 1);
        assert.strictEqual(stmt.params[0], true);
      });

      it('should accept an order option in the form of a String', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {order: 'age'});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` ORDER BY `age` ASC;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should accept an order option in the form of an Object', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {order: {age: 'desc'}});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` ORDER BY `age` DESC;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should accept an order option in the form of an Array<Object|String>', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {order: [{age: 'desc'}, 'id']});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` ORDER BY `age` DESC, `id` ASC;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should throw an error if order option is invalid', function () {
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {order: 123});
        });
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {order: function () {}});
        });
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {order: false});
        });
      });

      it('should accept a limit option in the form of an Integer', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {limit: 10});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` LIMIT 10;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should accept a limit option in the form of a String', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {limit: '15'});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` LIMIT 15;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should accept a limit option in the form of a Float', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {limit: 3.1475});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` LIMIT 3;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should throw an error if limit option is invalid', function () {
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {limit: false});
        });
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {limit: function () {}});
        });
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {limit: {}});
        });
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {limit: 0});
        });
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {limit: -10});
        });
      });

      it('should accept an offset option in the form of an Integer', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {offset: 10});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` OFFSET 10;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should accept an offset option in the form of a String', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {offset: '15'});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` OFFSET 15;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should accept an offset option in the form of a Float', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {offset: 3.1475});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` OFFSET 3;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should accept an offset option with zero (0) as value', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, null, {offset: 0});

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` OFFSET 0;');
        assert.lengthOf(stmt.params, 0);
      });

      it('should throw an error if offset option is invalid', function () {
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {offset: false});
        });
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {offset: function () {}});
        });
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {offset: {}});
        });
        assert.throws(function () {
          QueryBuilder.compileSelectSQL(employees, null, {offset: -10});
        });
      });

      it('should qualify column names on options = {qualify: true}', function () {
        var stmt = QueryBuilder.compileSelectSQL(employees, 1, {
          order: 'age',
          limit: 5,
          offset: 2,
          qualify: true
        });

        assert.strictEqual(stmt.sql, 'SELECT * FROM `employee` WHERE `employee`.id = ? ORDER BY `employee`.age ASC LIMIT 5 OFFSET 2;');
        assert.lengthOf(stmt.params, 1);
        assert.strictEqual(stmt.params[0], 1);
      });

    });

    describe('#compileCountSQL', function () {

      it('should accept a null selector', function () {
        var stmt = QueryBuilder.compileCountSQL(employees, null);

        assert.strictEqual(stmt.sql, 'SELECT COUNT(*) AS `count` FROM `employee`;');
        assert.lengthOf(stmt.params, 0);
      });

    });

    describe('#compileDeleteSQL', function () {

      it('should accept a selector, an order option and a limit option', function () {
        var stmt = QueryBuilder.compileDeleteSQL(employees, {age: 19}, {
          order: {id: 'desc'},
          limit: 2
        });

        assert.strictEqual(stmt.sql, 'DELETE FROM `employee` WHERE `age` = ? ORDER BY `id` DESC LIMIT 2;');
        assert.lengthOf(stmt.params, 1);
        assert.strictEqual(stmt.params[0], 19);
      });

    });

    describe('#compileUpsertSQL', function () {

      it('should accept attributes as Object', function () {
        var stmt = QueryBuilder.compileUpsertSQL(employees, {
          id: 2,
          firstName: 'Donnie',
          lastName: 'Azoff',
          age: 36,
          countryId: 1
        });

        assert.strictEqual(stmt.sql, 'INSERT INTO `employee` (`id`, `firstName`, `lastName`, `age`, `countryId`) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `firstName` = VALUES(`firstName`), `lastName` = VALUES(`lastName`), `age` = VALUES(`age`), `countryId` = VALUES(`countryId`);');
        assert.lengthOf(stmt.params, 5);
        assert.strictEqual(stmt.params[0], 2);
        assert.strictEqual(stmt.params[1], 'Donnie');
        assert.strictEqual(stmt.params[2], 'Azoff');
        assert.strictEqual(stmt.params[3], 36);
        assert.strictEqual(stmt.params[4], 1);
      });

      it('should accept attributes as Array<Object>', function () {
        var stmt = QueryBuilder.compileUpsertSQL(employees, [
          {
            id: 1,
            firstName: 'Danny',
            lastName: 'Porush'
          },
          {
            id: 2,
            firstName: 'Donnie',
            lastName: 'Azoff'
          }
        ]);

        assert.strictEqual(stmt.sql, 'INSERT INTO `employee` (`id`, `firstName`, `lastName`) VALUES (?, ?, ?), (?, ?, ?) ON DUPLICATE KEY UPDATE `firstName` = VALUES(`firstName`), `lastName` = VALUES(`lastName`);');
        assert.lengthOf(stmt.params, 6);
        assert.strictEqual(stmt.params[0], 1);
        assert.strictEqual(stmt.params[1], 'Danny');
        assert.strictEqual(stmt.params[2], 'Porush');
        assert.strictEqual(stmt.params[3], 2);
        assert.strictEqual(stmt.params[4], 'Donnie');
        assert.strictEqual(stmt.params[5], 'Azoff');
      });

      it('should throw an error if attributes are invalid', function () {
        assert.throws(function () {
          QueryBuilder.compileUpsertSQL(employees, []);
        });
        assert.throws(function () {
          QueryBuilder.compileUpsertSQL(employees, null);
        });
        assert.throws(function () {
          QueryBuilder.compileUpsertSQL(employees, true);
        });
        assert.throws(function () {
          QueryBuilder.compileUpsertSQL(employees, 123);
        });
        assert.throws(function () {
          QueryBuilder.compileUpsertSQL(employees, 'abc');
        });
        assert.throws(function () {
          QueryBuilder.compileUpsertSQL(employees, function () {});
        });
      });

    });

  });

});
