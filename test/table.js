require('dotenv').load(); // load environmental variables

var assert = require('chai').assert;
var Database = require('../src/Database');
var Table = require('../src/Table');

describe('Database', function () {

  var db = new Database({database: 'something'});
  var table = new Table(db, 'name');

  describe('@not-ready', function () {

    describe('#isReady', function () {

      it('returns false', function () {
        assert.strictEqual(table.isReady, false);
      });

    });

  });

});
