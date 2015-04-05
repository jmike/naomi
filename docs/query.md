# Query Syntax

A detailed description of the Naomi query syntax.

## Table of Contents

* [$orderby](#orderby)
* [$limit](#limit)
* [$offset](#offset)

### <a name="orderby" href="#orderby">$</a>orderby

Orders the records.

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

Limits the number of records.

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
