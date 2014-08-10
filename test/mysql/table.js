// // load environmental variables
// require('dotenv').load();

// var chai = require('chai'),
//   chaiAsPromised = require('chai-as-promised'),
//   naomi = require('../../src/naomi'),
//   assert, db;

// // enable promises assertion
// chai.use(chaiAsPromised);
// assert = chai.assert;

// // init database
// db = naomi.create('MYSQL', {
//   host: process.env.DATABASE_HOST,
//   port: parseInt(process.env.DATABASE_PORT, 10),
//   user: process.env.DATABASE_USERNAME,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE_SCHEMA
// });

// describe('MySQL:Table', function () {

//   describe('(@connected state)', function () {

//     before(function (done) {
//       db.once('ready', done).connect();
//     });

//     after(function (done) {
//       db.disconnect(done);
//     });

//     describe('regions', function () {

//       var regions;

//       before(function () {
//         regions = db.extend('region');
//       });

//       it('should have valid primary key', function () {
//         assert.isTrue(regions.isPrimaryKey('id'));
//       });

//     });

//     describe('countries', function () {

//       var countries;

//       before(function () {
//         countries = db.extend('country');
//       });

//       it('should have valid primary key', function () {
//         assert.isTrue(countries.isPrimaryKey('id'));
//       });

//     });

//     describe('employees', function () {

//       var employees;

//       before(function () {
//         employees = db.extend('employee');
//       });

//       it('should return error on #get() when column does not exist', function () {
//         assert.isRejected(employees.get({foo: 'bar'}), 'Column "foo" could not be found in table "employee"');
//       });

//       it('should return error on #count() when column does not exist', function () {
//         assert.isRejected(employees.count({foo: 'bar'}), 'Column "foo" could not be found in table "employee"');
//       });

//       it('should return error on #del() when column does not exist', function () {
//         assert.isRejected(employees.del({foo: 'bar'}), 'Column "foo" could not be found in table "employee"');
//       });

//     });


//   });

// });
