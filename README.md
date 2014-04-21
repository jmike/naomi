[![Build Status](https://travis-ci.org/jmike/naomi.png?branch=master)](https://travis-ci.org/jmike/naomi) [![Dependency Status](https://gemnasium.com/jmike/naomi.png)](https://gemnasium.com/jmike/naomi)

# Naomi

A simple, unopinionated, relational db client that manages repetitive CRUD tasks, while providing an easy interface for custom queries.

## Installation

```
$ npm install naomi
```

## Quick start

### How to create a database?

Use `naomi.create()` with the following parameters:

1. Database type (i.e. MYSQL) - POSTGRES is on the way;
2. Connection properties.

```
var naomi = require('naomi'),
  db;

// create db
db = naomi.create('MYSQL', {
  host: 'host',
  port: 3306,
  user: 'user',
  password: 'password',
  database: 'naomi_test',
});
```

### How to create a model?

After creating a database, you can call `db.extend()` with the name of an existing table.

```
var employees = db.extend('employees');
```

### Creating a model / with custom properties

Call `db.extend()` with the following parameters:

1. Table name;
2. Custom properties and methods.

```
var employees = db.extend('employees', {

  getAboveAge30: function (age, callback) {
    var sql, params;

    sql = 'SELECT * FROM employees WHERE age > ?;';
    params = [age]

    db.query(sql, params, callback);
  }

});
```

### How to user a model?

Creating a model gives you access to handy methods for managing repetitive CRUD tasks + counting records.

##### Creating/updating records

```
employees.set({
  firstName: 'Thomas',
  lastName: 'Anderson',
  age: 30
}, function (error) {
  if (error) {
    console.error(error);
    return;
  }

  // Thomas Anderson is created in db
});
```

This will result to the following SQL, run under the hood:

```
INSERT INTO `employees` SET `firstName` = 'Thomas', `lastName` = 'Anderson', `age` = 30 ON DUPLICATE KEY UPDATE `firstName` = VALUES(`firstName`), `lastName` = VALUES(`lastName`), `age` = VALUES(`age`);
```

So if you need to update a record, you should simply specify an ID or create a unique index in the table.

##### Retrieving data with ID

```
employees.get(1, function (error, records) {
  if (error) {
    console.error(error);
    return;
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `id` = 1;
```

##### Retrieving data with custom properties

```
employees.get({age: 30}, function (error, records) {
  if (error) {
    console.error(error);
    return;
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `age` = 30;
```

##### Retrieving data with multiple custom properties

```
employees.get({
  lastName: 'Anderson',
  age: 30
}, function (error, records) {
  if (error) {
    console.error(error);
    return;
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `lastName` = 'Anderson' AND `age` = 30;
```

##### Retrieving data with range of custom properties

```
employees.get([
  {
    lastName: 'Anderson',
    age: 30
  },
  {
    id: 1
  }
], function (error, records) {
  if (error) {
    console.error(error);
    return;
  }

  // do something with records
});
```

This will result to the following SQL, run under the hood:

```
SELECT * FROM `employees` WHERE `lastName` = 'Anderson' AND `age` = 30 OR `id` = 1;
```

##### Deleting records

```
employees.del(1, function (error) {
  if (error) {
    console.error(error);
    return;
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
employees.count(function (error, count) {
  if (error) {
    console.error(error);
    return;
  }

  // do something with count
});
```

This will result to the following SQL, run under the hood:

```
SELECT COUNT(*) AS 'count' FROM `employees`;
```

## Philosophy

Repetitive data queries can be compiled by machines. Complex data queries should be written by humans, because:

1. it requires creativity and imagination, that machines lack;
2. it's fun.
