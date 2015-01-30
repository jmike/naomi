require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var Database = require('../src/Database');

describe('Database', function () {

  var db = new Database({database: 'something'});

  describe('@disconnected', function () {

    describe('#isConnected', function () {

      it('returns false', function () {
        assert.strictEqual(db.isConnected, false);
      });

    });

  });

});
