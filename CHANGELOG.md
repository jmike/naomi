## 2.2.1 - 2016-05-18

* Make sure date datatype accepts millis timestamp when format is specified.

## 2.2.0 - 2016-05-02

* Implement missing Database#schema() method.
* Implement Database#query and Database#execute placeholder methods.
* Remove unecessary validation check in Database#collection() method.
* Optimize _createJoi() and fix validation issue with complex objects.

## 2.1.0 - 2016-05-02

* Edit babel settings to produce node v.4+ compatible code.
* Update eslint settings - use latest airbnb styleguide.
* Remove gulpfile in favour of npm scripts.
* Projection should also accept true / false values.
* Rewrite datatypes using es2015 classes.

## 2.0.1 - 2016-03-24

* Augment validate method with optional keys array.
* Rename #toJoi() to #createJoi in schema; pass keys to validate as arguments.
* Introduce hasAtomicPrimaryKey() method in schema.
* Bugfix: Respect default datatype property even when it's falsy

## 2.0.0 - 2016-03-24

* Accept function as default value in "Any" datatype.

## 2.0.0-beta.6 - 2016-03-24

* Get Joi validator for a specific key by passing the key name to schema#toJoi().

## 2.0.0-beta.5 - 2016-03-24

* Bugfix: Database is not defined in flowtype

## 2.0.0-beta.4 - 2016-03-24

* Expose email datatype.

## 2.0.0-beta.3 - 2016-03-24

* Expose method to extractKeys and validate AST keys.
* Ignore the lib folder from git repo.

## 2.0.0-beta.2 - 2016-03-24

* Bugfix: invalid parser reference in Collection.js.
* Compile to ./lib instead of ./dist.

## 2.0.0-beta.1 - 2016-03-23

* Refactor method names to make more sense.
* Add proper schema + validation functionality.

## 0.9.0 - 2015-04-06

* Rewrite docs and README.md.

## 0.9.0-beta.5 - 2015-04-01

* Spring cleanup of npm dependencies.

## 0.9.0-beta.4 - 2015-04-01

* Refactor postgres engine.

## 0.9.0-beta.3 - 2015-02-27

* Introduce Database#queryClient as low-level #query function.
* Use #queryClient in Transaction for DRY.
* Add Transaction#rollback method.
* Update mysql@2.5.5 to address Amazon RDS SSL cert update.

## 0.9.0-beta.2 - 2015-02-24

* Introduce mongo-like query language.
* Refactor the Transaction class.

## 0.9.0-beta.1 - 2015-02-06

* Enqueue queries until table is ready.

## 0.9.0-beta - 2015-02-02

* Load table metadata on Database#extend, not on Database#connect.
* Enable mongo-like query language.
* Documentation and Postgres support missing.

## 0.8.7 - 2014-10-29

* Fixed .npmignore to ignore .env, .jshintrc and asset files.

## 0.8.6 - 2014-10-27

* Added timeout option to MySQL #query() method.

## 0.8.5 - 2014-10-16

* Insert/update multiple records using a single statement in MySQL.
