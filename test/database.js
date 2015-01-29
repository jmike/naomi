require('dotenv').load(); // load environmental variables

var chai = require('chai');
var Database = require('../src/Database');
var assert = chai.assert;

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
