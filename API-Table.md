# Table API reference

## Table of Contents

* [Methods](#methods)
  * [getColumns([callback])](#getColumns)
  * [getPrimaryKey([callback])](#getPrimaryKey)
  * [getUniqueKeys([callback])](#getUniqueKeys)
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
    console.log('Table "' + table.name  + '" contains ' + columns.length + ' column(s)');
    columns.forEach(function (column, i) {
      console.log('The name of column #' + i + ' is ' + column.name);
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="getPrimaryKey" href="getPrimaryKey">#</a>getPrimaryKey([callback]) -> promise

Retrieves primary-key metadata from database. Please note: primary-key can be composite, i.e. consisting of more-than-one columns. 

##### Parameters

* `callback` _(function)_ optional callback function with (err, primaryKey) arguments

##### Returns

A promise resolving to array of strings, where each item represents a column name.

##### Example

```javascript
table.getPrimaryKey()
  .then(function (primaryKey) {
    console.log('Primary-key of table "' + table.name + '" consists of ' + primaryKey.length + ' column(s)');
    primaryKey.forEach(function (column, i) {
      console.log('The name of primary-key column #' + i + ' is ' + column);
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="getUniqueKeys" href="getUniqueKeys">#</a>getUniqueKeys([callback]) -> promise

Retrieves unique-key metadata from database. Please note: a table may have multiple, as well as composite, unique-keys.

##### Parameters

* `callback` _(function)_ optional callback function with (err, uniqueKeys) arguments

##### Returns

A promise resolving to an object, where each property represents a unique-key.

##### Example

```javascript
table.getUniqueKeys()
  .then(function (uniqueKeys) {
    console.log('Table "' + table.name + '" has ' + Object.keys(uniqueKeys).length + ' unique-key(s)');
    Object.keys(uniqueKeys).forEach(function (key, i) {
      console.log('The name of unique-key #' + i + ' is ' + key);
      uniqueKeys[key].forEach(function (column, i) {
        console.log('The name of column #' + i + ' of unique-key "' + key + '" is ' + column);
      }
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="getIndexKeys" href="getIndexKeys">#</a>getIndexKeys([callback]) -> promise

Retrieves index-key metadata from database. Please note: a table may have multiple, as well as composite, index-keys.

##### Parameters

* `callback` _(function)_ optional callback function with (err, indexKeys) arguments

##### Returns

A promise resolving to an object, where each property represents an index-key.

##### Example

```javascript
table.getIndexKeys()
  .then(function (indexKeys) {
    console.log('Table "' + table.name + '" has ' + Object.keys(uniqueKeys).length + ' index-key(s)');
    Object.keys(indexKeys).forEach(function (key, i) {
      console.log('The name of index-key #' + i + ' is ' + key);
      indexKeys[key].forEach(function (column, i) {
        console.log('The name of column #' + i + ' of index-key "' + key + '" is ' + column);
      }
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```
