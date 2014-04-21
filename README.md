[![Build Status](https://travis-ci.org/jmike/naomi.png?branch=master)](https://travis-ci.org/jmike/naomi) [![Dependency Status](https://gemnasium.com/jmike/naomi.png)](https://gemnasium.com/jmike/naomi)

# Naomi

A simple, unopinionated, relational db client that provides handy methods for handling repetitive tasks and an easy way to run custom queries.

## Installation

```
$ npm install naomi
```

## Quick start

### Creating a database

Call `naomi.create()` with the following parameters:

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

### Creating a model

Call `db.extend()` with the name of an existing table in database.

```
var employees = db.extend('employees');
```

### Creating a model / with custom properties

Call `db.extend()` with the following parameters:

1. Table name;
2. Custom properties and methods.

```
var employees = db.extend('employees', {

  getByFirstName: function (firstName, callback) {
    var sql, params;

    sql = 'SELECT * FROM employees WHERE firstName = ?;';
    params = [firstName]

    db.query(sql, params, callback);
  }

});
```

### Putting the model to use

Creating a model gives you access to handy methods for handling repetitive tasks, such as simple CRUD function.

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

  // Thomas Anderson has been created in db
});
```

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

## Philosophy

Repetitive data queries can be compiled by machines. Complex data queries should be written by humans. Because (a) it's fun and (b) it requires creativity.
