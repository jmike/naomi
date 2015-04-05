# Query Syntax

A detailed description of the Naomi query syntax.

## Table of Contents

* [$projection](#projection)
* [$orderby](#orderby)
* [$limit](#limit)
* [$offset](#offset)
* [$and](#and)
* [$or](#or)

### <a name="projection" href="#projection">$</a>projection

Sets the columns of records in a dataset.

##### Accepted Values

* Plain object

##### Example

```javascript
var $query = {
  $projection: {
    firstname: 1,
    lastname: 1
  }
};
```

The above is the rough equivalent of:

```sql
SELECT firstname, lastname
```

You may also exclude column(s) and get only the columns that are left is left.

```javascript
var $query = {
  $projection: {
    id: -1,
    age: -1
  }
};
```

### <a name="orderby" href="#orderby">$</a>orderby

Orders the records in a dataset.

##### Accepted Values

* Array of objects or strings

##### Example

```javascript
var $query = {
  $orderby: [
    {age: -1}, // i.e. DESC
    firstname, // i.e. ASC by default
    {lastname: 1} // i.e. ASC
  ]
};
```

The above is the rough equivalent of:

```sql
ORDER BY age DESC, firstname ASC, lastname ASC
```

### <a name="limit" href="#limit">$</a>limit

Limits the number of records in a dataset.

##### Accepted Values

* Positive integer, i.e. > 0

##### Example

```javascript
var $query = {
  $limit: 5
};
```

The above is the rough equivalent of:

```sql
LIMIT 5
```

### <a name="offset" href="#offset">$</a>offset

Skips the designated number of records.

##### Accepted Values

* Non-negative integer, i.e. >= 0

##### Example

```javascript
var $query = {
  $limit: 5,
  $offset: 10
};
```

The above is the rough equivalent of:

```sql
LIMIT 5 OFFSET 10
```

#### Notes

Can only be used in combination with [$limit](#limit)
