# Changelog

## 0.9.0-beta.5 - 2015.04.01

* Spring cleanup of npm dependencies

## 0.9.0-beta.4 - 2015.04.01

* Refactor postgres engine

## 0.9.0-beta.3 - 2015.02.27

* Introduce Database#queryClient as low-level #query function
* Use #queryClient in Transaction for DRY
* Add Transaction#rollback method
* Update mysql@2.5.5 to address Amazon RDS SSL cert update

## 0.9.0-beta.2 - 2015.02.24

* Introduce mongo-like query language
* Refactor the Transaction class

## 0.9.0-beta.1 - 2015.02.06

* Enqueue queries until table is ready

## 0.9.0-beta - 2015.02.02

* Load table metadata on Database#extend, not on Database#connect
* Enable mongo-like query language
* Documentation and Postgres support missing

## 0.8.7 - 2014-10-29

* Fixed .npmignore to ignore .env, .jshintrc and asset files

## 0.8.6 - 2014-10-27

* Added timeout option to the MySQL #query() method

## 0.8.5 - 2014-10-16

* Insert/update multiple records using a single statement in MySQL
