require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  naomi = require('../src/naomi'),
  Transaction = require('../src/mysql/Transaction'),
  assert = chai.assert,
  db, transaction;

db = naomi.create({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT, 10),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_SCHEMA
});

describe('MySQL Transaction', function () {

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

    it('has no internal db client assigned', function () {
      assert.isNull(transaction._client);
    });

  });

  describe('@init', function () {

    before(function (done) {
      transaction.begin(done);
    });

    it('resolved promise with results on #query()', function (done) {
      transaction.query('SELECT 1;').then(function (results) {
        assert.isArray(results);
        done();
      });
    });

    after(function (done) {
      transaction.commit(done);
    });

  });

});
