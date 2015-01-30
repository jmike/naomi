var path = require('path');
var Mocha = require('mocha');

// init mocha
var mocha = new Mocha({
  reporter: 'spec',
  timeout: 30000 // 30 secs
});

// load the test files
mocha.addFile(path.resolve(__dirname, './naomi'));
mocha.addFile(path.resolve(__dirname, './database'));
mocha.addFile(path.resolve(__dirname, './mysql-database'));
mocha.addFile(path.resolve(__dirname, './postgres-database'));
mocha.addFile(path.resolve(__dirname, './queryparser'));
mocha.addFile(path.resolve(__dirname, './table'));
// mocha.addFile(path.resolve(__dirname, './mysql-table'));
// mocha.addFile(path.resolve(__dirname, './mysql-transaction'));
// mocha.addFile(path.resolve(__dirname, './postgres-querybuilder'));
// mocha.addFile(path.resolve(__dirname, './postgres-table'));
// mocha.addFile(path.resolve(__dirname, './postgres-transaction'));

// run the tests
mocha.run(function (failures) {
  process.on('exit', function () {
    process.exit(failures);
  });
});
