# Datatypes

A detailed description of Naomi datatypes and their relative properties.

## Table of Contents

* [date](#date)
  * [date.format](#dateformat)
  * [date.max](#datemax)
  * [date.min](#datemin)
* [enum](#enum)
  * [enum.values](#enumvalues)
* [float](#float)
  * [float.max](#floatmax)
  * [float.min](#floatmin)
  * [float.negative](#floatnegative)
  * [float.positive](#floatpositive)
  * [float.precision](#floatprecision)
  * [float.scale](#floatscale)
* [integer](#integer)
  * [integer.max](#integermax)
  * [integer.min](#integermin)
  * [integer.negative](#integernegative)
  * [integer.positive](#integernegative)
* [string](#string)
  * [string.length](#stringlength)
  * [string.lowercase](#stringlowercase)
  * [string.maxLength](#stringmaxlength)
  * [string.minLength](#stringminlength)
  * [string.regex](#stringregex)
  * [string.trim](#stringtrim)
  * [string.uppercase](#stringuppercase)
* [uuid](#uuid)

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

Notes: 'now' can be passed in lieu of date so as to always compare relatively to the current date, allowing to explicitly ensure a date is either in the past or in the future, e.g.

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


## enum

### <a name="enumvalues" href="enumvalues">#</a>enum.values

Specifies allowed values.

##### Parameters

* `values` _(Array<string>)_ an array of allowed values for this enumeration.

##### Example

```javascript
enum.values = ['one', 'two', 'three'];
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


## integer

### <a name="integermax" href="integermax">#</a>integer.max

Specifies the maximum allowed value.

##### Parameters

* `max` _(number)_ the maximum value allowed.

##### Example

```javascript
integer.max = 999.99;
```

### <a name="integermin" href="integermin">#</a>integer.min

Specifies the minimum allowed value.

##### Parameters

* `min` _(number)_ the minimum value allowed.

##### Example

```javascript
integer.min = -1.1;
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

## uuid

A datatype to store [Universal Unique Identifiers](https://en.wikipedia.org/wiki/Universally_unique_identifier). Values must follow the UUID v4 format.
