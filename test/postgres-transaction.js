require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  Transaction = require('../src/postgres/Transaction'),
  assert = chai.assert,
  db, transaction;

db = naomi.create('postgres', {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE
});

describe('Postgres Transaction', function () {

  before(function (done) {
    db.once('ready', done);
    db.connect().then(function () {
      transaction = new Transaction(db);
    });
  });

  after(function (done) {
    db.disconnect(done);
  });

  describe('@void', function () {

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
      assert.isNull(transaction._client);
    });

  });

  describe('@initialized', function () {

    before(function (done) {
      transaction.begin(done);
    });

    it('has valid internal db client', function () {
      assert.isNotNull(transaction._client);
    });

    it('resolves promise with results on #query()', function (done) {
      transaction.query('LOCK TABLE "employees" IN SHARE ROW EXCLUSIVE MODE;')
      .then(function () {
        return transaction.query('WITH upsert AS (UPDATE "employees" SET "age" = ? WHERE "firstname" = ? AND "lastname" = ? RETURNING *) INSERT INTO "employees" ("firstname", "lastname", "age") SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM upsert);', [38, 'James', 'Bond', 'James', 'Bond', 38]);
      }).then(function () {
        transaction.query('DELETE FROM "employees" WHERE "firstname" = ? AND "lastname" = ?;', ['James', 'Bond'], done);
      });
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
      assert.isNull(transaction._client);
    });

  });

});
