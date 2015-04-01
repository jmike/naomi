require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var naomi = require('../../src/naomi');
var Transaction = require('../../src/postgres/Transaction');

describe('Postgres Transaction', function () {

  var db = naomi.create('postgres', {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
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
      transaction.query('LOCK TABLE "employees" IN SHARE ROW EXCLUSIVE MODE;')
        .then(function () {
          return transaction.query('WITH upsert AS (UPDATE "employees" SET "age" = ? WHERE "firstname" = ? AND "lastname" = ? RETURNING *) INSERT INTO "employees" ("firstname", "lastname", "age") SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM upsert);', [38, 'James', 'Bond', 'James', 'Bond', 38]);
        })
        .then(function () {
          transaction.query('DELETE FROM "employees" WHERE "firstname" = ? AND "lastname" = ?;', ['James', 'Bond'], done);
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
