# Naomi

A simple relational db client for Node.js that takes care of the repetitive CRUD tasks, while providing an easy interface for custom queries.

[![Build Status](https://travis-ci.org/jmike/naomi.png?branch=master)](https://travis-ci.org/jmike/naomi) [![Dependency Status](https://gemnasium.com/jmike/naomi.png)](https://gemnasium.com/jmike/naomi)

## Installation

```
$ npm install naomi
```

#### Requirements

* MySQL 5.5+
* PostgreSQL 9.1+
* Node.js 0.8+

## How to use

#### Creating a database

Use naomi#create() to construct a new [Database](https://github.com/jmike/naomi/wiki/Database).

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

#### Running custom queries

```javascript
var sql = 'SELECT `firstname`, `lastname` FROM `employees` WHERE `id` = ?;',
  params = [1];

db.query(sql, params).then(function (records) {

  if (records.length === 0) {
    console.warn('Not found');
  } else {
    console.log(records[0]);
  }

}).catch(function (err) {
  console.error(err);
});
```

#### Mapping a table

After creating a database, you may call #extend() with the name of an existing table.

```javascript
var employees = db.extend('employees');
```

#### Mapping a table + custom properties

```javascript
var employees = db.extend('employees', {

  getDistinctNames: function (age, callback) {
    var sql = 'SELECT DISTINCT "firstName" FROM "employees" LIMIT 100;';
    return db.query(sql, callback);
  }

});
```

#### Creating records in table

```javascript
employees.add({
  firstName: 'Thomas',
  lastName: 'Anderson',
  age: 30
}).then(function (keys) {
  console.log('Employee created with id ' + keys.id);
}).catch(function (err) {
  console.error(err);
});
```

The above will result to the following SQL statement, run under the hood:

```
INSERT INTO `employees` SET `firstName` = 'Thomas', `lastName` = 'Anderson', `age` = 30;
```

#### Creating / Updating (if already exists) records to table

```javascript
employees.set({
  firstName: 'Thomas',
  lastName: 'Anderson',
  age: 32
}).then(function (keys) {
  console.log('Employee set with id ' + keys.id);
}).catch(function (err) {
  console.error(err);
});
```

The above will result to the following SQL statement, run under the hood:

```sql
INSERT INTO `employees` SET `firstName` = 'Thomas', `lastName` = 'Anderson', `age` = 32 ON DUPLICATE KEY UPDATE `firstName` = VALUES(`firstName`), `lastName` = VALUES(`lastName`), `age` = VALUES(`age`);
```

##### Retrieving records by ID

```
employees.get(1, function (err, records) {
  if (err) {
    return console.error(err);
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `id` = 1;
```

##### Retrieving records by custom field

```
employees.get({age: 30}, function (err, records) {
  if (err) {
    return console.error(err);
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `age` = 30;
```

##### Retrieving records by multiple custom fields

```
employees.get({
  lastName: 'Anderson',
  age: {'>=': 30}
}, function (err, records) {
  if (err) {
    return console.error(error);
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `lastName` = 'Anderson' AND `age` >= 30;
```

##### Retrieving records by range of custom fields

```
employees.get([
  {
    lastName: 'Anderson',
    age: {'!=': 30}
  },
  {
    id: 1
  }
], function (err, records) {
  if (err) {
    return console.error(err);
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `lastName` = 'Anderson' AND `age` != 30 OR `id` = 1;
```

##### Retrieving records using custom operators

```
employees.get({
  lastName: 'Anderson',
  age: {'!=': null}
}, function (err, records) {
  if (err) {
    return console.error(err);
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `lastName` = 'Anderson' AND `age` IS NOT NULL;
```

The following operators are allowed:

Name | Operator
:--- | :---:
Equal operator | =
Not equal operator | !=
Greater than operator | >
Greater than or equal operator | >=
Less than operator | <
Less than or equal operator | <=

Please not that {'=': null} compiles to 'IS NULL' and {'=': null} compiles to 'IS NOT NULL'.

##### Retrieving records with ORDER BY clause

```
employees.get({age: {'>': 18}}, {
  order: 'lastName',
}, function (err, records) {
  if (err) {
    return console.error(err);
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `age` > 18 ORDER BY `lastName` ASC;
```

##### Retrieving records with complex ORDER BY clause

```
employees.get({age: {'>': 18}}, {
  order: ['lastName', {id: 'desc'}],
}, function (err, records) {
  if (err) {
    return console.error(err);
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `age` > 18 ORDER BY `lastName` ASC, `id` DESC;
```

##### Retrieving records using LIMIT and OFFSET

```
employees.get({age: {'>': 18}}, {
  order: 'lastName',
  limit: 10,
  offset: 20
}, function (err, records) {
  if (err) {
    return console.error(err);
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `age` > 18 ORDER BY `lastName` LIMIT 10 OFFSET 20;
```

##### Deleting records

```
employees.del(1, function (err) {
  if (err) {
    return console.error(err);
  }

  // employee with id #1 is deleted
});
```

This will result to the following SQL, run under the hood:

```
DELETE FROM `employees` WHERE id = 1;
```

##### Counting records

```
employees.count(function (err, count) {
  if (err) {
    return console.error(err);
  }

  // do something with count
});
```

This will result to the following SQL, run under the hood:

```
SELECT COUNT(*) AS 'count' FROM `employees`;
```

## Philosophy

Databases, besides data, contain a lot of metadata. Stuff like:

* Column names + datatypes;
* Indices, e.g. primary keys, unique keys;
* Relations.

These metadata can be extracted from the database and are sufficient for compiling basic validation rules and application structure.

Still, the current breed of tools (e.g. ORMs) tend to ignore database metadata and replicate that information in the application layer. This results to:

* Unnecessary complexity;
* Synchronization issues;
* Reduced expressiveness.

##### How is Naomi different?

Naomi works the other way around:

1. You first create the database using a tool of your choice, e.g. [MySQL Workbench](http://www.mysql.com/products/workbench/), [pgAdmin](http://www.pgadmin.org/) - a tool you know and love;
2. You call a few simple methods to bring meta-information to the application.

While this approach may seem intriguing to new developers, it is in fact the natural way of thinking for experienced users. Creating a database requires creativity and imagination that machines lack. Data architects create the database structure and developers write the SQL code.

Naomi takes care of SQL code by automating repetitive data queries. And if you need some custom logic you can always write it yourself.

## Contributors

Author: [Dimitrios C. Michalakos](https://github.com/jmike)

## License

MIT
