require('dotenv').load({silent: true});
require('babel/register');

var path = require('path');
var Mocha = require('mocha');

// init mocha
var mocha = new Mocha({
  reporter: 'spec',
  timeout: 30000 // 30 secs
});

// load the test files
mocha.addFile(path.resolve(__dirname, './queryparser'));

// run the tests
mocha.run(function (failures) {
  process.on('exit', function () {
    process.exit(failures);
  });
});

// var path = require('path');
// var Mocha = require('mocha');

// // init mocha
// var mocha = new Mocha({
//   reporter: 'spec',
//   timeout: 30000 // 30 secs
// });

// // load the test files
// mocha.addFile(path.resolve(__dirname, './naomi'));

// mocha.addFile(path.resolve(__dirname, './mysql/database'));
// mocha.addFile(path.resolve(__dirname, './mysql/equal'));
// mocha.addFile(path.resolve(__dirname, './mysql/not-equal'));
// mocha.addFile(path.resolve(__dirname, './mysql/greater-than'));
// mocha.addFile(path.resolve(__dirname, './mysql/greater-than-or-equal'));
// mocha.addFile(path.resolve(__dirname, './mysql/less-than'));
// mocha.addFile(path.resolve(__dirname, './mysql/less-than-or-equal'));
// mocha.addFile(path.resolve(__dirname, './mysql/like'));
// mocha.addFile(path.resolve(__dirname, './mysql/not-like'));
// mocha.addFile(path.resolve(__dirname, './mysql/in'));
// mocha.addFile(path.resolve(__dirname, './mysql/not-in'));
// mocha.addFile(path.resolve(__dirname, './mysql/id'));
// mocha.addFile(path.resolve(__dirname, './mysql/and'));
// mocha.addFile(path.resolve(__dirname, './mysql/or'));
// mocha.addFile(path.resolve(__dirname, './mysql/expression'));
// mocha.addFile(path.resolve(__dirname, './mysql/filter'));
// mocha.addFile(path.resolve(__dirname, './mysql/projection'));
// mocha.addFile(path.resolve(__dirname, './mysql/orderby'));
// mocha.addFile(path.resolve(__dirname, './mysql/limit'));
// mocha.addFile(path.resolve(__dirname, './mysql/offset'));
// mocha.addFile(path.resolve(__dirname, './mysql/values'));
// mocha.addFile(path.resolve(__dirname, './mysql/select'));
// mocha.addFile(path.resolve(__dirname, './mysql/count'));
// mocha.addFile(path.resolve(__dirname, './mysql/delete'));
// mocha.addFile(path.resolve(__dirname, './mysql/insert'));
// mocha.addFile(path.resolve(__dirname, './mysql/upsert'));
// mocha.addFile(path.resolve(__dirname, './mysql/table'));
// mocha.addFile(path.resolve(__dirname, './mysql/transaction'));

// mocha.addFile(path.resolve(__dirname, './postgres/database'));
// mocha.addFile(path.resolve(__dirname, './postgres/equal'));
// mocha.addFile(path.resolve(__dirname, './postgres/not-equal'));
// mocha.addFile(path.resolve(__dirname, './postgres/greater-than'));
// mocha.addFile(path.resolve(__dirname, './postgres/greater-than-or-equal'));
// mocha.addFile(path.resolve(__dirname, './postgres/less-than'));
// mocha.addFile(path.resolve(__dirname, './postgres/less-than-or-equal'));
// mocha.addFile(path.resolve(__dirname, './postgres/like'));
// mocha.addFile(path.resolve(__dirname, './postgres/not-like'));
// mocha.addFile(path.resolve(__dirname, './postgres/in'));
// mocha.addFile(path.resolve(__dirname, './postgres/not-in'));
// mocha.addFile(path.resolve(__dirname, './postgres/id'));
// mocha.addFile(path.resolve(__dirname, './postgres/and'));
// mocha.addFile(path.resolve(__dirname, './postgres/or'));
// mocha.addFile(path.resolve(__dirname, './postgres/expression'));
// mocha.addFile(path.resolve(__dirname, './postgres/filter'));
// mocha.addFile(path.resolve(__dirname, './postgres/projection'));
// mocha.addFile(path.resolve(__dirname, './postgres/orderby'));
// mocha.addFile(path.resolve(__dirname, './postgres/limit'));
// mocha.addFile(path.resolve(__dirname, './postgres/offset'));
// mocha.addFile(path.resolve(__dirname, './postgres/table'));
// mocha.addFile(path.resolve(__dirname, './postgres/transaction'));

// // run the tests
// mocha.run(function (failures) {
//   process.on('exit', function () {
//     process.exit(failures);
//   });
// });
