require('dotenv').load(); // load environmental variables

var chai = require('chai'),
  MySQLEngine = require('../src/MySQLEngine'),
  assert = chai.assert,
  engine;

engine = new MySQLEngine({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT, 10),
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_SCHEMA
});

describe('MySQL database engine', function () {

  before(function (done) {
    engine.connect().then(done);
  });

  after(function (done) {
    engine.disconnect().then(done);
  });

  describe('#query()', function () {

    it('retrieves records from database on valid input', function (done) {
      engine.query('SELECT 1;', [], {}).then(function (records) {
        assert.isArray(records);
        assert.lengthOf(records, 1);
        done();
      });
    });

  });

});
