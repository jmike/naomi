var assert = require('chai').assert,
  naomi = require('../../src/naomi'),
  db = naomi.create('MYSQL', {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 3306,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_SCHEMA
  });

describe('MySQL Database::query', function () {

  it('should throw an error when attempting to query while disconnected', function (done) {
    assert.throws(db.query.bind(db, 'SELECT 1;'));

    db.query('SELECT 1;', function (error) {
      assert.instanceOf(error, Error);
      done();
    });
  });

  it('should throw an error when params are invalid', function () {
    assert.throws(db.query.bind(db));

    assert.throws(db.query.bind(db, 1));
    assert.throws(db.query.bind(db, true));
    assert.throws(db.query.bind(db, {}));
    assert.throws(db.query.bind(db, []));

    assert.throws(db.query.bind(db, 'SELECT 1;', 1));
    assert.throws(db.query.bind(db, 'SELECT 1;', true));
    assert.throws(db.query.bind(db, 'SELECT 1;', 'foo'));
    assert.throws(db.query.bind(db, 'SELECT 1;', {}));

    assert.throws(db.query.bind(db, 'SELECT 1;', [], 1));
    assert.throws(db.query.bind(db, 'SELECT 1;', [], true));
    assert.throws(db.query.bind(db, 'SELECT 1;', [], 'foo'));
    assert.throws(db.query.bind(db, 'SELECT 1;', [], []));

    assert.throws(db.query.bind(db, 'SELECT 1;', [], {}, 1));
    assert.throws(db.query.bind(db, 'SELECT 1;', [], {}, true));
    assert.throws(db.query.bind(db, 'SELECT 1;', [], {}, 'foo'));
    assert.throws(db.query.bind(db, 'SELECT 1;', [], {}, []));
  });

});
