# Datatypes

A detailed description of Naomi datatypes and their relative properties.

## Table of Contents

* [date](#date)
  * [date.default](#datedefault)
  * [date.format](#dateformat)
  * [date.max](#datemax)
  * [date.min](#datemin)
  * [date.nullable](#datenullable)
* [enum](#enum)
  * [enum.default](#enumdefault)
  * [enum.nullable](#enumnullable)
  * [enum.values](#enumvalues)
* [float](#float)
  * [float.default](#floatdefault)
  * [float.max](#floatmax)
  * [float.min](#floatmin)
  * [float.negative](#floatnegative)
  * [float.nullable](#floatnullable)
  * [float.positive](#floatpositive)
  * [float.precision](#floatprecision)
  * [float.scale](#floatscale)
* [integer](#integer)
  * [integer.autoinc](#integerautoinc)
  * [integer.default](#integerdefault)
  * [integer.max](#integermax)
  * [integer.min](#integermin)
  * [integer.negative](#integernegative)
  * [integer.nullable](#integernullable)
  * [integer.positive](#integernegative)
* [number](#number)
  * [number.default](#numberdefault)
  * [number.max](#numbermax)
  * [number.min](#numbermin)
  * [number.negative](#numbernegative)
  * [number.nullable](#numbernullable)
  * [number.positive](#numbernegative)
* [string](#string)
  * [string.default](#stringdefault)
  * [string.length](#stringlength)
  * [string.lowercase](#stringlowercase)
  * [string.maxLength](#stringmaxlength)
  * [string.minLength](#stringminlength)
  * [string.nullable](#stringnullable)
  * [string.regex](#stringregex)
  * [string.trim](#stringtrim)
  * [string.uppercase](#stringuppercase)
* [uuid](#uuid)
  * [uuid.default](#uuiddefault)
  * [uuid.nullable](#uuidnullable)

## date

### <a name="dateformat" href="dateformat">#</a>date.format

Specifies the allowed date format.

##### Parameters

* `format` _(string)_ a string that follows the moment.js [format](http://momentjs.com/docs/#/parsing/string-format/).

##### Example

```javascript
date.format = 'YYYY-MM-DD';
```

### <a name="datemax" href="datemax">#</a>date.max

Specifies the latest date allowed.

##### Parameters

* `max` _(string)_ string representation of the latest date allowed.

##### Example

```javascript
date.max = '2016-03-25';
```

##### Notes

You may use `now` instead of an actual date so as to always compare relatively to the current date, allowing to explicitly ensure a date is either in the past or in the future, e.g.

```javascript
date.max = 'now';
```

### <a name="datemin" href="datemin">#</a>date.min

Specifies the oldest date allowed.

##### Parameters

* `min` _(string)_ string representation of the oldest date allowed.

##### Example

```javascript
date.min = '1970-01-01';
```

### <a name="datedefault" href="datedefault">#</a>date.default

Sets a default value if the original value is undefined.

##### Parameters

* `default` _(string, Date, Function)_ the default value.

##### Example

```javascript
date.default = '2016-02-29';
```

##### Notes

You may also specify a function to return the default value, e.g.

```javascript
date.default = Date.now;
```

### <a name="datenullable" href="datenullable">#</a>date.nullable

Marks the datatype as optional, which allows the `undefined` and `null` values.

##### Parameters

* `nullable` _(boolean)_ whether the datatype is nullable.

##### Example

```javascript
date.nullable = true;
```


## enum

### <a name="enumvalues" href="enumvalues">#</a>enum.values

Specifies allowed values.

##### Parameters

* `values` _(Array<string>)_ an array of allowed values for this enumeration.

##### Example

```javascript
enum.values = ['one', 'two', 'three'];
```

### <a name="enumdefault" href="enumdefault">#</a>enum.default

Sets a default value if the original value is undefined.

##### Parameters

* `default` _(string, Function)_ the default value.

##### Example

```javascript
enum.default = 'one';
```

##### Notes

You may also specify a function to return the default value.

### <a name="enumnullable" href="enumnullable">#</a>enum.nullable

Marks the datatype as optional, which allows the `undefined` and `null` values.

##### Parameters

* `nullable` _(boolean)_ whether the datatype is nullable.

##### Example

```javascript
enum.nullable = true;
```


## float

### <a name="floatmax" href="floatmax">#</a>float.max

Specifies the maximum allowed value.

##### Parameters

* `max` _(number)_ the maximum value allowed.

##### Example

```javascript
float.max = 999.99;
```

### <a name="floatmin" href="floatmin">#</a>float.min

Specifies the minimum allowed value.

##### Parameters

* `min` _(number)_ the minimum value allowed.

##### Example

```javascript
float.min = -1.1;
```

### <a name="floatnegative" href="floatnegative">#</a>float.negative

If set to true requires value to be negative.

##### Parameters

* `negative` _(boolean)_ whether the value is negative.

##### Example

```javascript
float.negative = true;
```

### <a name="floatpositive" href="floatpositive">#</a>float.positive

If set to true requires value to be positive.

##### Parameters

* `positive` _(boolean)_ whether the value is positive.

##### Example

```javascript
float.positive = true;
```

### <a name="floatprecision" href="floatprecision">#</a>float.precision

Specifies the number of total digits allowed in value, including decimals.

##### Parameters

* `precision` _(number)_ total digits allowed in value.

##### Example

```javascript
float.precision = 5;
```

### <a name="floatscale" href="floatscale">#</a>float.scale

Specifies the number of decimal digits allowed in value.

##### Parameters

* `precision` _(number)_ number of decimal digits allowed in value.

##### Example

```javascript
float.scale = 2;
```

### <a name="floatdefault" href="floatdefault">#</a>float.default

Sets a default value if the original value is undefined.

##### Parameters

* `default` _(number, Function)_ the default value.

##### Example

```javascript
float.default = 12.34;
```

##### Notes

You may also specify a function to return the default value.

```javascript
float.default = Math.PI;
```

### <a name="floatnullable" href="floatnullable">#</a>float.nullable

Marks the datatype as optional, which allows the `undefined` and `null` values.

##### Parameters

* `nullable` _(boolean)_ whether the datatype is nullable.

##### Example

```javascript
float.nullable = true;
```


## integer

### <a name="integerautoinc" href="integerautoinc">#</a>integer.autoinc

If set to true marks value as automatically incremented. This has no effect in validation, but is essential to communicating with the database.

##### Parameters

* `autoinc` _(boolean)_ whether the value is automatically incremented.

##### Example

```javascript
integer.autoinc = true;
```

### <a name="integermax" href="integermax">#</a>integer.max

Specifies the maximum allowed value.

##### Parameters

* `max` _(number)_ the maximum value allowed.

##### Example

```javascript
integer.max = 999;
```

### <a name="integermin" href="integermin">#</a>integer.min

Specifies the minimum allowed value.

##### Parameters

* `min` _(number)_ the minimum value allowed.

##### Example

```javascript
integer.min = -100;
```

### <a name="integernegative" href="integernegative">#</a>integer.negative

If set to true requires value to be negative.

##### Parameters

* `negative` _(boolean)_ whether the value is negative.

##### Example

```javascript
integer.negative = true;
```

### <a name="integerpositive" href="integerpositive">#</a>integer.positive

If set to true requires value to be positive.

##### Parameters

* `positive` _(boolean)_ whether the value is positive.

##### Example

```javascript
integer.positive = true;
```

### <a name="integerdefault" href="integerdefault">#</a>integer.default

Sets a default value if the original value is undefined.

##### Parameters

* `default` _(number, Function)_ the default value.

##### Example

```javascript
integer.default = 123;
```

##### Notes

You may also specify a function to return the default value, e.g.

```javascript
integer.default = Number.MAX_SAFE_INTEGER;
```

### <a name="integernullable" href="integernullable">#</a>integer.nullable

Marks the datatype as optional, which allows the `undefined` and `null` values.

##### Parameters

* `nullable` _(boolean)_ whether the datatype is nullable.

##### Example

```javascript
integer.nullable = true;
```


## number

### <a name="numbermax" href="numbermax">#</a>number.max

Specifies the maximum allowed value.

##### Parameters

* `max` _(number)_ the maximum value allowed.

##### Example

```javascript
number.max = 999.99;
```

### <a name="numbermin" href="numbermin">#</a>number.min

Specifies the minimum allowed value.

##### Parameters

* `min` _(number)_ the minimum value allowed.

##### Example

```javascript
number.min = -1.1;
```

### <a name="numbernegative" href="numbernegative">#</a>number.negative

If set to true requires value to be negative.

##### Parameters

* `negative` _(boolean)_ whether the value is negative.

##### Example

```javascript
number.negative = true;
```

### <a name="numberpositive" href="numberpositive">#</a>number.positive

If set to true requires value to be positive.

##### Parameters

* `positive` _(boolean)_ whether the value is positive.

##### Example

```javascript
number.positive = true;
```

### <a name="numberdefault" href="numberdefault">#</a>number.default

Sets a default value if the original value is undefined.

##### Parameters

* `default` _(number, Function)_ the default value.

##### Example

```javascript
number.default = 123;
```

##### Notes

You may also specify a function to return the default value, e.g.

```javascript
number.default = Number.MAX_SAFE_number;
```

### <a name="numbernullable" href="numbernullable">#</a>number.nullable

Marks the datatype as optional, which allows the `undefined` and `null` values.

##### Parameters

* `nullable` _(boolean)_ whether the datatype is nullable.

##### Example

```javascript
number.nullable = true;
```


## string

### <a name="stringlength" href="stringlength">#</a>string.length

Specifies the exact string length required.

##### Parameters

* `length` _(number)_ the exact string length required.

##### Example

```javascript
string.length = 3;
```

### <a name="stringlowercase" href="stringlowercase">#</a>string.lowercase

Requires the string value to be all lowercase.

##### Parameters

* `lowercase` _(boolean)_ whether the string value is all lowercase.

##### Example

```javascript
string.lowercase = true;
```

### <a name="stringuppercase" href="stringuppercase">#</a>string.uppercase

Requires the string value to be all uppercase.

##### Parameters

* `uppercase` _(boolean)_ whether the string value is all uppercase.

##### Example

```javascript
string.uppercase = true;
```

### <a name="stringmaxlength" href="stringmaxlength">#</a>string.maxLength

Specifies the maximum number of string characters allowed.

##### Parameters

* `maxLength` _(number)_ the maximum number of string characters allowed.

##### Example

```javascript
string.maxLength = 5;
```

### <a name="stringminlength" href="stringminlength">#</a>string.minLength

Specifies the minimum number of string characters allowed.

##### Parameters

* `minLength` _(number)_ the minimum number of string characters allowed.

##### Example

```javascript
string.minLength = 1;
```

### <a name="stringregex" href="stringregex">#</a>string.regex

Defines a regular expression rule to validate values against.

##### Parameters

* `regex` _(string, RegExp)_ a regular expression rule.

##### Example

```javascript
string.regex = /^[abc]+$/;
```

### <a name="stringtrim" href="stringtrim">#</a>string.trim

Requires the string value to contain no whitespace before or after.

##### Parameters

* `trim` _(boolean)_ whether the value allows whitespace before or after.

##### Example

```javascript
string.trim = true;
```

### <a name="stringdefault" href="stringdefault">#</a>string.default

Sets a default value if the original value is undefined.

##### Parameters

* `default` _(string, Function)_ the default value.

##### Example

```javascript
string.default = 'abc';
```

##### Notes

You may also specify a function to return the default value.

### <a name="stringnullable" href="stringnullable">#</a>string.nullable

Marks the datatype as optional, which allows the `undefined` and `null` values.

##### Parameters

* `nullable` _(boolean)_ whether the datatype is nullable.

##### Example

```javascript
string.nullable = true;
```


## uuid

A datatype to store [Universal Unique Identifiers](https://en.wikipedia.org/wiki/Universally_unique_identifier). Values must follow the UUID v4 format.

### <a name="uuiddefault" href="uuiddefault">#</a>uuid.default

Sets a default value if the original value is undefined.

##### Parameters

* `default` _(string, Function)_ the default value.

##### Example

The following example assumes use of the notorious [node-uuid](https://github.com/broofa/node-uuid) library.

```javascript
var uuidGenerator = require('uuid');
uuid.default = uuidGenerator.v4;
```

### <a name="uuidnullable" href="uuidnullable">#</a>uuid.nullable

Marks the datatype as optional, which allows the `undefined` and `null` values.

##### Parameters

* `nullable` _(boolean)_ whether the datatype is nullable.

##### Example

```javascript
uuid.nullable = true;
```
