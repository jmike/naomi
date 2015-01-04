# Table API reference

## Table of Contents

* [Methods](#methods)
  * [getColumns([callback])](#getColumns)
  * [getPrimaryKey([callback])](#getPrimaryKey)
* [Events](#events)
  * [ready](#ready-event)

## Methods

### <a name="getColumns" href="getColumns">#</a>getColumns([callback]) -> promise

Retrieves column metadata from database.

##### Parameters

* `callback` _(function)_ optional callback function with (err, columns) arguments

##### Returns

A promise resolving to array of objects, having the following properties.

* `name` _(string)_ the column name
* `type` _(string)_ the column datatype, e.g. "VARCHAR"
* `isNullable` _(boolean)_ indicates whether the column accepts `null` values
* `isAutoInc` _(boolean)_ indicates whether the column is automatically incremented
* `default` _(boolean, string, number, null)_ the column default value
* `collation` _(string)_ the column collation
* `comment` _(string, null)_ some commentary about the column

##### Example

```javascript
table.getColumns()
  .then(function (columns) {
    console.log('Table contains ' + columns.length + ' column(s)');
    columns.forEach(function (column, i) {
      console.log('The name of column #' + i + ' is ' + column.name);
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="getPrimaryKey" href="getPrimaryKey">#</a>getPrimaryKey([callback]) -> promise

Retrieves primary key metadata from database. Please note: primary key can be composite, i.e. consisting of more-than-one columns. 

##### Parameters

* `callback` _(function)_ optional callback function with (err, column) arguments

##### Returns

A promise resolving to array of strings, where each item represents a column name.

##### Example

```javascript
table.getPrimaryKey()
  .then(function (columns) {
    console.log('Primary key consists of ' + columns.length + ' column(s)');
    columns.forEach(function (column, i) {
      console.log('The name of column #' + i + ' is ' + column);
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```
