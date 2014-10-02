# Naomi

A simple ORM for Node.js that takes care of the repetitive CRUD tasks, while providing a handy interface for custom queries.

[![Build Status](https://travis-ci.org/jmike/naomi.png?branch=master)](https://travis-ci.org/jmike/naomi) [![Dependency Status](https://gemnasium.com/jmike/naomi.png)](https://gemnasium.com/jmike/naomi)

#### Features

* Supports MySQL and PostgreSQL databases;
* Written entirely in javascript, i.e. does not require compilation;
* Distributed under the MIT license, i.e. you can use it both in commercial and open-source projects;
* Supports transactions and custom queries;
* Exposes promise and callback interfaces;
* Makes extensive use of unit-tests;
* Is battle-tested under heavy load in production environments;
* Is different, i.e. uses existing database metadata instead of redefining the db structure in the application layer.

## Installation

```
$ npm install naomi
```

#### Requirements

* MySQL 5.5+ or PostgreSQL 9.1+
* Node.js 0.8+

## Quick start

#### Connect to database

Use [naomi#create()](https://github.com/jmike/naomi/wiki/naomi#create) to construct a new [Database](https://github.com/jmike/naomi/wiki/Database) instance. For further info refer to the [API reference](https://github.com/jmike/naomi/wiki/API-reference).

MySQL example:

```javascript
var naomi = require('naomi'),
  db;

db = naomi.create('mysql', {
  host: 'host',
  port: 3306,
  user: 'user',
  password: 'password',
  database: 'schema',
});
```

Postgres example:

```javascript
var naomi = require('naomi'),
  db;

db = naomi.create('postgres', {
  host: 'host',
  port: 5432,
  user: 'user',
  password: 'password',
  database: 'database',
});
```

#### Run custom queries

Use [Database#query()](https://github.com/jmike/naomi/wiki/Database#query) to run a _parameterised_ SQL query. For further info refer to the [API reference](https://github.com/jmike/naomi/wiki/API-reference).

MySQL example:

```javascript
var sql = 'SELECT `firstname`, `lastname` FROM `employees` WHERE `id` = ?;',
  params = [1];

db.query(sql, params)
  .then(function (records) {
    if (records.length === 0) {
      console.warn('Not found');
    } else {
      console.log(records[0]);
    }
  })
  .catch(function (err) {
    console.error(err);
  });
```

Postgres example:

```javascript
var sql = 'SELECT "firstname", "lastname" FROM "employees" WHERE "id" = ?;',
  params = [1];

db.query(sql, params)
  .then(function (records) {
    if (records.length === 0) {
      console.warn('Not found');
    } else {
      console.log(records[0]);
    }
  })
  .catch(function (err) {
    console.error(err);
  });
```

#### Map table to object

You wouldn't normally use an ORM to run custom queries. Naomi provides the [Table](https://github.com/jmike/naomi/wiki/Table) class to map tables to objects and run repretitive CRUD tasks.

Use [Database#extend()](https://github.com/jmike/naomi/wiki/Database#extend) to create a new Table instance.

```javascript
var employees = db.extend('employees');
```

The Table class exposes the following methods:

1. Table#add() - create records in table;
2. Table#set() - create or update records in table;
3. Table#get() - read records from table;
4. Table#del() - delete records in table;
5. Table#count() - count records in table;

#### Map table with custom properties

In case a Table's methods are not enough, you can write your own custom methods.

Postgres example:

```javascript
var employees = db.extend('employees', {

  getDistinctNames: function (age, callback) {
    var sql = 'SELECT DISTINCT "firstName" FROM "employees" LIMIT 100;';
    return db.query(sql, callback);
  }

});
```

#### Create records in table

```javascript
employees.add({
  firstName: 'Thomas',
  lastName: 'Anderson',
  age: 30
})
  .then(function (pk) {
    console.log('Employee created with id ' + pk.id);
  })
  .catch(function (err) {
    console.error(err);
  });
```

The above will result to the following SQL statement, run under the hood:

```
INSERT INTO `employees` SET `firstName` = 'Thomas', `lastName` = 'Anderson', `age` = 30;
```

For further info refer to the [API reference](https://github.com/jmike/naomi/wiki/API-reference).

#### Create / Update records in table

```javascript
employees.set({
  firstName: 'Thomas',
  lastName: 'Anderson',
  age: 32
})
  .then(function (pk) {
    console.log('Employee set with id ' + pk.id);
  })
  .catch(function (err) {
    console.error(err);
  });
```

The above will result to the following SQL statement, run under the hood:

```sql
INSERT INTO `employees` SET `firstName` = 'Thomas', `lastName` = 'Anderson', `age` = 32 ON DUPLICATE KEY UPDATE `firstName` = VALUES(`firstName`), `lastName` = VALUES(`lastName`), `age` = VALUES(`age`);
```

You may enforce updating a record by explicitly specifying a primary key or unique index.

```javascript
employees.set({
  id: 1,
  firstName: 'Thomas',
  lastName: 'Anderson',
  age: 32
});
```

For further info refer to the [API reference](https://github.com/jmike/naomi/wiki/API-reference).

#### Retrieve records from table

```javascript
employees.get({age: 30})
  .then(function (records) {
    // do something with records
  })
  .catch(function (err) {
    console.error(err);
  });
```

This will result to the following SQL, run under the hood:

```sql
SELECT * FROM `employees` WHERE `age` = 30;
```

In case of tables with simple primary keys, i.e. primary keys composed by a single column, you may also do:

```javascript
employees.get(1)
  .then(function (records) {
    // do something with records
  })
  .catch(function (err) {
    console.error(err);
  });
```

This will result to the following SQL, run under the hood:

```sql
SELECT * FROM `employees` WHERE `id` = 1;
```

Table#get() can get fairly complicated, e.g. using complex selectors, order, limit, offset, etc. For further info refer to the [API reference](https://github.com/jmike/naomi/wiki/API-reference).

#### Delete records from table

```javascript
employees.del(1)
  .then(function () {
    // record has been deleted
  });
```

This will result to the following SQL, run under the hood:

```sql
DELETE FROM `employees` WHERE id = 1;
```

For further info refer to the [API reference](https://github.com/jmike/naomi/wiki/API-reference).

#### Count records in table

```javascript
employees.count()
  .then(function (n) {
    // do something with count
  });
```

This will result to the following SQL, run under the hood:

```sql
SELECT COUNT(*) AS 'count' FROM `employees`;
```

For further info refer to the [API reference](https://github.com/jmike/naomi/wiki/API-reference).

## Philosophy

Databases, besides data, contain metadata - stuff like:

* Column names + datatypes;
* Indices (primary keys, unique keys, etc);
* Constraints;
* Relations.

These metadata can be extracted from the database and are sufficient for generating basic validation rules and application structure. Yet most ORM tools tend to ignore database metadata and replicate that information in the application layer. This results to:

* *Unnecessary complexity*, i.e. you trade SQL with an ORM-specific API that is equally complex;
* *Synchronization issues*, i.e. sky falls on your head when you change the db schema;
* *Reduced expressiveness*, i.e. no ORM can fully implement the expressiveness of SQL.

##### How is Naomi different?

Naomi works the other way around:

1. You first create the database using a tool of your choice, e.g. [MySQL Workbench](http://www.mysql.com/products/workbench/), [pgAdmin](http://www.pgadmin.org/) - a tool you already know;
2. You call a few simple methods to extract meta-information to the application layer.

While this approach may seem intriguing to new developers, it is in fact the natural way of thinking for experienced engineers. Creating a database requires creativity and imagination that machines lack.

Naomi takes care of SQL code by automating repetitive data queries. And if you need some custom logic you can always write it yourself.

## Contributors

Author: [Dimitrios C. Michalakos](https://github.com/jmike)

## License

MIT
