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
mocha.addFile(path.resolve(__dirname, './database'));
mocha.addFile(path.resolve(__dirname, './collection'));
mocha.addFile(path.resolve(__dirname, './queryparsers/selection'));
mocha.addFile(path.resolve(__dirname, './queryparsers/projection'));
mocha.addFile(path.resolve(__dirname, './queryparsers/orderby'));
mocha.addFile(path.resolve(__dirname, './queryparsers/limit'));
mocha.addFile(path.resolve(__dirname, './queryparsers/offset'));
mocha.addFile(path.resolve(__dirname, './datatypes/integer'));
mocha.addFile(path.resolve(__dirname, './datatypes/float'));
mocha.addFile(path.resolve(__dirname, './datatypes/number'));
mocha.addFile(path.resolve(__dirname, './datatypes/string'));
mocha.addFile(path.resolve(__dirname, './datatypes/uuid'));
mocha.addFile(path.resolve(__dirname, './datatypes/enum'));
mocha.addFile(path.resolve(__dirname, './datatypes/date'));
mocha.addFile(path.resolve(__dirname, './datatypes/boolean'));
mocha.addFile(path.resolve(__dirname, './datatypes/binary'));

// run the tests
mocha.run(function (failures) {
  process.on('exit', function () {
    process.exit(failures);
  });
});
