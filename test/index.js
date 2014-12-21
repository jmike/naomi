var path = require('path'),
  Mocha = require('mocha'),
  mocha;

// init mocha
mocha = new Mocha({
  reporter: 'spec',
  timeout: 30000 // 30 secs
});

// load the test files
mocha.addFile(path.resolve(__dirname, './naomi'));
mocha.addFile(path.resolve(__dirname, './mysql-database'));
mocha.addFile(path.resolve(__dirname, './mysql-querybuilder'));
mocha.addFile(path.resolve(__dirname, './mysql-table'));
mocha.addFile(path.resolve(__dirname, './mysql-transaction'));
mocha.addFile(path.resolve(__dirname, './postgres-database'));
mocha.addFile(path.resolve(__dirname, './postgres-querybuilder'));
mocha.addFile(path.resolve(__dirname, './postgres-table'));
mocha.addFile(path.resolve(__dirname, './postgres-transaction'));

// run the tests
mocha.run(function (failures) {
  process.on('exit', function () {
    process.exit(failures);
  });
});
