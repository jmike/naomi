# Naomi

A detailed description of the transaction API.

## Table of Contents

* [Methods](#methods)
  * [begin([callback])](#begin)
  * [commit([callback])](#commit)
  * [rollback([callback])](#rollback)
  * [query(sql, [params], [options], [callback])](#query)

## Methods

### <a name="begin" href="#begin">#</a>begin([callback]) -> Promise

Initiates the transaction.

##### Parameters

* `callback` _(Function)_ an optional callback function with (err, transaction) arguments

##### Returns

A promise resolving to this transaction.

### <a name="commit" href="#commit">#</a>commit([callback]) -> Promise

Commits the transaction.
Please note: transaction will become effectively useless after calling this method.

##### Parameters

* `callback` _(Function)_ an optional callback function with (err, transaction) arguments

##### Returns

A promise resolving to this transaction.

##### Example

```javascript
transaction.commit()
  .then(function () {
    // transaction successfully commited
  })
  .catch(function (err) {
    console.error(err);]
  });
```

### <a name="rollback" href="#rollback">#</a>rollback([callback]) -> Promise

Rolls back the transaction.
Please note: transaction will become effectively useless after calling this method.

##### Parameters

* `callback` _(Function)_ an optional callback function with (err, transaction) arguments

##### Returns

A promise resolving to this transaction.

##### Example

```javascript
transaction.rollback()
  .then(function () {
    // transaction has been rolled back
  })
  .catch(function (err) {
    console.error(err);]
  });
```

### <a name="query" href="query">#</a>query(sql, [params], [options], [callback]) -> promise

Executes the given parameterized SQL statement as part of the transaction.

##### Parameters

* `sql` _(String, Object)_ a parameterized SQL statement
* `params` _(Array)_ an optional array of parameter values
* `options` _(Object)_ optional query options
  * `nestTables` (Boolean, String) applies only to MySQL database (see [Joins with overlapping column names](https://github.com/felixge/node-mysql/#joins-with-overlapping-column-names)) 
* `callback` _(Function)_ an optional callback function with (err, records) arguments

##### Returns

A promise resolving to an array of records for SELECT statements and an object of metadata for DML statements.

##### Example

```javascript
var sql = 'SELECT * FROM persons WHERE age > ? ORDER BY firstname ASC';
var params = [18];

transaction.query(sql, params)
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
