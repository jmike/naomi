# Table API reference

## Table of Contents

* [Methods](#methods)
  * [getColumns([callback])](#getColumns)
  * [getPrimaryKey([callback])](#getPrimaryKey)
  * [getUniqueKeys([callback])](#getUniqueKeys)
  * [getIndexKeys([callback])](#getIndexKeys)
  * [getForeignKeys([callback])](#getForeignKeys)
  * [hasColumn(column)](#hasColumn)
  * [isPrimaryKey(columns*)](#isPrimaryKey)
  * [isUniqueKey(columns*)](#isUniqueKey)
  * [isIndexKey(columns*)](#isIndexKey)
  * [isAutoInc(column)](#isAutoInc)
  * [get(selector, [options], [callback])](#get)
  * [count(selector, [options], [callback])](#count)
  * [del(selector, [options], [callback])](#del)
  * [set(records, [callback])](#set)
  * [add(records, [callback])](#add)
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

Retrieves primary key metadata from database. Please note: primary keys can be composite, i.e. consisting of more-than-one columns.

##### Parameters

* `callback` _(function)_ optional callback function with (err, primaryKey) arguments

##### Returns

A promise resolving to array of strings, where each item represents a column name.

##### Example

```javascript
table.getPrimaryKey()
  .then(function (primaryKey) {
    primaryKey.forEach(function (column, i) {
      console.log('Column #' + i + ' of primary key is ' + column);
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="getUniqueKeys" href="getUniqueKeys">#</a>getUniqueKeys([callback]) -> promise

Retrieves unique key metadata from database. Please note: a table may have multiple, as well as composite, unique keys.

##### Parameters

* `callback` _(function)_ optional callback function with (err, uniqueKeys) arguments

##### Returns

A promise resolving to an array of objects, having the following properties.

* `name` _(string)_ the name of the unique key
* `columns` _(Array.<string>)_ the column names of the unique key

##### Example

```javascript
table.getUniqueKeys()
  .then(function (uniqueKeys) {
    uniqueKeys.forEach(function (key) {
      console.log('Unique key ' + key.name + ' contains ' + key.columns.length + ' column(s)');
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="getIndexKeys" href="getIndexKeys">#</a>getIndexKeys([callback]) -> promise

Retrieves index key metadata from database. Please note: A table may have multiple, as well as composite, index keys.

##### Parameters

* `callback` _(function)_ optional callback function with (err, indexKeys) arguments

##### Returns

A promise resolving to an array of objects, having the following properties.

* `name` _(string)_ the name of the index key
* `columns` _(Array.<string>)_ the column names of the index key

##### Example

```javascript
table.getIndexKeys()
  .then(function (indexKeys) {
    indexKeys.forEach(function (key) {
      console.log('Index key "' + key.name + '" contains ' + key.columns.length + ' column(s)');
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="getForeignKeys" href="getForeignKeys">#</a>getForeignKeys([callback]) -> promise

Retrieves foreign key metadata from database. Please note: a table may have multiple, as well as composite, foreign keys.

##### Parameters

* `callback` _(function)_ optional callback function with (err, foreignKeys) arguments

##### Returns

A promise resolving to an array of objects, having the following properties.

* `name` _(string)_ the foreign-key name
* `references` _(Array.<object>)_ foreign-key references
  * `table1` _(string)_ table name #1
  * `column1` _(string)_ column name #1
  * `table2` _(string)_ table name #2
  * `column2` _(string)_ column name #2

##### Example

```javascript
table.getForeignKeys()
  .then(function (foreignKeys) {
    foreignKeys.forEach(function (key) {
      console.log('Foreign key "' + key.name + '" contains ' + key.references.length + ' reference(s)');
    });
  })
  .catch(function (err) {
    console.error(err);
  });
```

### <a name="hasColumn" href="hasColumn">#</a>hasColumn(column) -> boolean

Indicates whether the specified column exists in table. Please note: this method will always return false until database is ready.

##### Parameters

* `columns` _(string)_ the name of the column (required)

##### Returns

`true` if column exists in table, `false` if not.

##### Example

```javascript
if (table.hasColumn('firstname')) {
  // do something
}
```

### <a name="isPrimaryKey" href="isPrimaryKey">#</a>isPrimaryKey(columns*) -> boolean

Indicates whether the designated column(s) represent a primary key. Please note: primary keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params in this function. This method will always return false until database is ready.

##### Parameters

* `columns` _(...string)_ the name of the column(s)

##### Returns

`true` if column(s) represent a primary key, `false` if not.

##### Example

```javascript
if (table.isPrimaryKey('firstname', 'lastname')) {
  // do something
}
```

### <a name="isUniqueKey" href="isUniqueKey">#</a>isUniqueKey(columns*) -> boolean

Indicates whether the designated column(s) represent a unique key. Please note: unique keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params in this function. This method will always return false until database is ready.

##### Parameters

* `columns` _(...string)_ the name of the column(s)

##### Returns

`true` if column(s) represent a unique key, `false` if not.

##### Example

```javascript
if (table.isUniqueKey('firstname', 'lastname')) {
  // do something
}
```

### <a name="isIndexKey" href="isIndexKey">#</a>isIndexKey(columns*) -> boolean

Indicates whether the designated column(s) represent an index key. Please note: index keys may be compound, i.e. composed of multiple columns, hence the acceptance of multiple params. This method will always return false until database is ready.

##### Parameters

* `columns` _(...string)_ the name of the column(s)

##### Returns

`true` if column(s) represent an index key, `false` if not.

##### Example

```javascript
if (table.isIndexKey('firstname', 'lastname')) {
  // do something
}
```

### <a name="isAutoInc" href="isAutoInc">#</a>isAutoInc(column) -> boolean

Indicates whether the specified column is automatically incremented. Please note: this method will always return false until database is ready.

##### Parameters

* `column` _(string)_ the name of the column

##### Returns

`true` if column is auto incremented, `false` if not.

##### Example

```javascript
if (table.isAutoInc('id')) {
  // do something
}
```

## Events

### <a name="ready-event" href="#ready-event">@</a>ready

Event "ready" is emitted when table is ready to use, i.e. has loaded metadata in memory.

```javascript
table.once('ready', function () {
  console.log('metadata loaded - table ready to use');
});
```