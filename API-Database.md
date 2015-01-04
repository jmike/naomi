# Database API reference

## Table of Contents

* [Methods](#methods)
  * [connect([callback])](#connect)
  * [disconnect([callback])](#disconnect)
  * [query(sql, [params], [options], [callback])](#query)
  * [hasTable(table, [callback])](#hasTable)
  * [extend(table, props)](#extend)
* [Events](#events)
  * [connect](#connect-event)
  * [disconnect](#disconnect-event)
  * [ready](#ready-event)

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

A promise resolving to an array of records for SELECT statements and an object of metadata for DML statements.

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

### <a name="hasTable" href="hasTable">#</a>hasTable(table, [callback]) -> promise

Indicates whether the designated table exists in database.

##### Parameters

* `table` _(string)_ the name of the table to look for (required)
* `callback` _(function)_ optional callback function with (err, hasTable) arguments

##### Returns

A promise resolving to a boolean value.

##### Example

```javascript
db.hasTable('accounts')
  .then(function (hasTable) {
    if (hasTable) {
      // table exists in database
    } else {) {
      // table not found in database
    }
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="extend" href="extend">#</a>extend(table, props) -> Table

Returns a new Table, extended with the given properties and methods. Please note: this method will not create a new table on database - it will merely reference an existing one.

##### Parameters

* `table` _(string)_ the name of the table to look for (required)
* `props` _(object)_ optional properties and methods

##### Returns

New Table instance.

##### Example

```javascript
var accounts = db.extend('accounts', {

  getAccountProducts: function (accountId) {
    var sql = 'SELECT * FROM accounts LEFT OUTER JOIN products ON product.account_id = accounts.id AND accounts.id = ?';
    var params = [accountId];
    return this.query(sql, params);
  }

});
```

## Events

### <a name="connect-event" href="#connect-event">@</a>connect

Event "connect" is emitted when database connection is established.

##### Example

```javascript
db.on('connect', function () {
  console.log('connected to db');
});
```

### <a name="disconnect-event" href="#disconnect-event">@</a>disconnect

Event "disconnect" is emitted when database is disconnected.

```javascript
db.on('disconnect', function () {
  console.log('disconnected from db');
});
```

### <a name="ready-event" href="#ready-event">@</a>ready

Event "ready" is emitted when all pending tables tables are ready to use, i.e. have loaded metadata in memory.

```javascript
db.once('ready', function () {
  console.log('metadata loaded - tables ready to use');
});
```
