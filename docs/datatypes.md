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
  * [float.positive](#floatnegative)
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

* `format` _(Function)_ string or array of strings that follow the moment.js [format](http://momentjs.com/docs/#/parsing/string-format/).

##### Example

```javascript
date.format = 'YYYY-MM-DD';
```
