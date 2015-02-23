require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var naomi = require('../src/naomi');
var Transaction = require('../src/mysql/Transaction');

describe('MySQL Transaction', function () {

  var db = naomi.create('mysql', {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  var transaction;

  before(function (done) {
    db.connect()
      .then(function () {
        transaction = new Transaction(db);
      })
      .then(done)
      .catch(done);
  });

  after(function (done) {
    db.disconnect(done);
  });

  describe('@void', function () {

    it('rejects promise on #commit() with "invalid transaction state"', function (done) {
      transaction.commit()
        .catch(function (err) {
          assert.match(err, /invalid transaction state/i);
          done();
        });
    });

    it('rejects promise on #query() with "invalid transaction state"', function (done) {
      transaction.query('SELECT 1;')
        .catch(function (err) {
          assert.match(err, /invalid transaction state/i);
          done();
        });
    });

    it('has null internal db client', function () {
      assert.isNull(transaction.client);
    });

  });

  describe('@initialized', function () {

    before(function (done) {
      transaction.begin(done);
    });

    it('has valid internal db client', function () {
      assert.isNotNull(transaction.client);
    });

    it('resolves promise with results on #query()', function (done) {
      transaction.query('INSERT INTO `employees` SET firstname = ?, lastname = ?, age = ?;', ['James', 'Bond', 38])
        .then(function () {
          return transaction.query('DELETE FROM `employees` WHERE id = LAST_INSERT_ID();');
        })
        .then(function (results) {
          assert.strictEqual(results.affectedRows, 1);
          done();
        })
        .catch(done);
    });

  });

  describe('@commited', function () {

    before(function (done) {
      transaction.commit(done);
    });

    it('rejects promise on #commit() with "invalid transaction state"', function (done) {
      transaction.commit().catch(function (err) {
        assert.match(err, /invalid transaction state/i);
        done();
      });
    });

    it('rejects promise on #query() with "invalid transaction state"', function (done) {
      transaction.query('SELECT 1;').catch(function (err) {
        assert.match(err, /invalid transaction state/i);
        done();
      });
    });

    it('has null internal db client', function () {
      assert.isNull(transaction.client);
    });

  });

});
