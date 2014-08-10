var chai = require('chai'),
  naomi = require('../src/naomi'),
  Database = require('../src/Database'),
  assert = chai.assert;

describe('naomi', function () {

  describe('#create()', function () {

    it('returns a new Database when type is valid', function () {
      var db = naomi.create('mysql');
      assert.instanceOf(db, Database);
    });

  });

});
