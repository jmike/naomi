require('dotenv').load({silent: true});
require('babel-core/register');

const path = require('path');
const Mocha = require('mocha');

// init mocha
const mocha = new Mocha({
  reporter: 'spec',
  timeout: 30000 // 30 secs
});

// load the test files
mocha.addFile(path.resolve(__dirname, './schema'));
mocha.addFile(path.resolve(__dirname, './naomi'));
mocha.addFile(path.resolve(__dirname, './queryparser'));
mocha.addFile(path.resolve(__dirname, './database'));
mocha.addFile(path.resolve(__dirname, './collection'));

// run the tests
mocha.run(function (failures) {
  process.on('exit', function () {
    process.exit(failures);
  });
});
