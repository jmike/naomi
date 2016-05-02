# Naomi

A simple ORM for Node.js that takes care of the repetitive CRUD tasks, while providing a handy interface for custom queries.

#### Features

* Accepts mongo-like query language to perform repretitive CRUD (+ count) tasks;
* Provides a handy interface for native queries, e.g. SQL;
* Leverages existing database meta-data instead of redefining the db schema in the application layer;
* Exposes promise and callback APIs.

## Installation

```
$ npm install naomi
```

#### Requirements

* Node.js v.4+

#### Connectors currently available

| Connector | Maintainer | Build status | npm version |
|---|---|:---:|:---:|
| [naomi-mysql](https://github.com/jmike/naomi-mysql) | [jmike](https://github.com/jmike) | [![Build Status](https://travis-ci.org/jmike/naomi-mysql.svg?branch=master)](https://travis-ci.org/jmike/naomi-mysql) | [![npm version](https://badge.fury.io/js/naomi-mysql.svg)](https://badge.fury.io/js/naomi-mysql) |

## Quick start

Install naomi and the appropriate connector for your database, e.g. `naomi-mysql`.

```
$ npm install naomi --save
$ npm install naomi-mysql --save
```

Register connector with Naomi under name "mysql".

```javascript
var naomi = require('naomi');
var mysql = require('naomi-mysql');

naomi.register('mysql', mysql);
```

Use [naomi#create()](naomi.md#create) to create a new [Database](database.md).

```javascript
var db = naomi.create('mysql', {
  host: 'host',
  port: 3306,
  user: 'user',
  password: 'password',
  database: 'schema',
});
```

Connect to database using [Database#connect()](database.md#connect). Please note you may use the callback interface instead of promises.

```javascript
db.connect()
  .then(() => {
    console.log('connected');
  })
  .catch((err) => {
    console.error(err);
  });
```

Run custom queries using [Database#execute()](database.md#exectute).

```javascript
var sql = ;
var params = ;

db.execute({
  sql: 'SELECT `firstname`, `lastname` FROM `employees` WHERE `id` = ?;', // please note: ? will be replaced with 1 from params array
  params: [1]
})
  .then((results) => {
    if (results.length === 0) {
      console.warn('Not found');
    } else {
      console.log(results[0]);
    }
  })
  .catch(function (err) {
    console.error(err);
  });
```

You wouldn't normally use an ORM to run custom queries. Naomi provides a [Collection](collection.md) interface to map database collections (e.g. tables) to objects and run repretitive CRUD tasks.

Use [Database#collection()](database.md#collection) to create a new Collection.

###### Specifying schema definition

```javascript
var employees = db.collection('employees', {
  id: { type: 'integer', autoinc: true, min: 0 },
  firstname: { type: 'string', maxLength: 45, nullable: true },
  lastname: { type: 'string', maxLength: 45, nullable: true },
  age: { type: 'integer', min: 18, max: 100 }
});
```

###### Pulling schema definition from database

```javascript
var employees = db.collection('employees');

employees.reverseEngineer()
  .then(() => {
    console.log('schema updated');
  })
  .catch(function (err) {
    console.error(err);
  });
```

The Collection class exposes the following methods:

1. [find()](collection.md#find) - retrieves records from the collection;
2. [findOne()](collection.md#findOne) - retrieves a single record from the collection;
3. [findStream()](collection.md#findStream) - retrieves records from the collection as a readable stream;
4. [count()](collection.md#count) - counts records in the collection;
5. [remove()](collection.md#remove) - removes records from the collection;
6. [insert()](collection.md#insert) - inserts record(s) to the collection;
7. [upsert()](collection.md#upsert) - upserts record(s) to the collection;
8. [upsert()](collection.md#upsert) - upserts record(s) to the collection;
9. [update()](https://github.com/jmike/naomi/blob/master/docs/table.md#set) - updates record(s) in the collection with the supplied payload.

Additional collection methods may exist depending on the database connector.

## API Docs

* [Naomi singleton](https:/github.com//jmike/naomi-docs/naomi.md)
* [Database](https://github.com/jmike/naomi-docs/database.md)
* [Schema](https://github.com/jmike/naomi-docs/schema.md)
* [Collection](https://github.com/jmike/naomi-docs/collection.md)

## Philosophy

Databases, besides data, contain meta-data; stuff like `keys`, `datatypes`, `indices`, `constraints` and `relations`.

These meta-data can be extracted from the database and are sufficient for generating basic validation rules and application structure. Yet most ORM tools tend to ignore meta-data living in the database and replicate that information in the application layer, which results to:

* Unnecessary complexity, i.e. you trade a native query language (like SQL) with an ORM-specific API that is equally complex;
* Synchronization issues, i.e. the sky falls on your head every time you change the database schema;
* Reduced expressiveness, i.e. no ORM can fully implement the expressiveness of a native query language.

##### How is Naomi different?

Naomi is different in 2 ways:

1. It provides methods to run repetitive CRUD (+ count) operations using a familiar mongo-like query language. When that's not enough it allows you run native queries directly to the database.
2. It exposes simple methods to extract meta-data from the database, thus eliminating the need to recreate the information in the application layer and putting you (not the ORM) in charge of your schema.

With Naomi you have the freedom to create the database using a tool of your choice, e.g. [MySQL Workbench](http://www.mysql.com/products/workbench/) or [pgAdmin](http://www.pgadmin.org/). While this approach may seem intriguing to new developers, it is in fact the natural way of thinking for experienced engineers. Creating a database requires creativity and imagination that machines lack. It is a task made for humans.

## Acknowledgements

This project would not be without the extraordinary work of:

* Petka Antonov (https://github.com/petkaantonov/bluebird)
* Nicolas Morel (https://github.com/hapijs/joi)
* Felix Geisendörfer (https://github.com/felixge/node-mysql)

## Contribute

Source code contributions are most welcome. The following rules apply:

1. Follow the [Airbnb Style Guide](https://github.com/airbnb/javascript);
2. Make sure not to break the tests.

## License

MIT
