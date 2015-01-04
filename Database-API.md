# API reference

## Table of Contents

* [Methods](#methods)
  * [connect([callback])](#connect)
  * [disconnect([callback])](#disconnect)
  * [query(sql, [params], [options], [callback])](#query)

## Methods

### <a name="connect" href="connect">#</a>connect([callback]) -> promise

Attempts to connect to the database server.

##### Parameters

* `callback` _(function)_ optional callback function with (err) arguments

##### Returns

An empty promise.

##### Emits

@connect

##### Example

```javascript
db.connect()
  .then(function () {
    console.log('connected to db');
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="disconnect" href="disconnect">#</a>disconnect([callback]) -> promise

Gracefully closes any open connection to the database server.
Please note: database will become practically useless after calling this method.

##### Parameters

* `callback` _(function)_ optional callback function with (err) arguments

##### Returns

An empty promise.

##### Emits

@disconnect

##### Example

```javascript
db.disconnect()
  .then(function () {
    console.log('disconnected from db');
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="query" href="query">#</a>query(sql, [params], [options], [callback]) -> promise

Executes the given parameterized SQL statement.

##### Parameters

* `sql` _(string)_ a parameterized SQL statement (required)
* `params` _(Array)_ an optional array of parameter values
* `options` _(object)_ optional query options
* `callback` _(function)_ optional callback function with (err, records) arguments

##### Returns

Query results

##### Example

```javascript
var sql = 'SELECT * FROM persons WHERE age > ? ORDER BY firstname ASC';
var params = [18];

db.query(sql, params)
  .then(function (records) {
    if (records.length === 0) {
      // query returned no results
    } else {
      records.forEach(function (r) {
        // do something with record
      });
    }
  })
  .catch(function (err) {
    console.error(err);
  });
```
