> Naomi

A detailed description of the naomi module.

## Table of Contents

* [Quick start](#wiki-quick-start)
* [Methods](#methods)
  * [create(engine, [props])](#create)

## Quick start

Reference naomi by requiring the homonymous module.

```javascript
var naomi = require('naomi');
```

## Methods

### <a name="create" href="#wiki-create">#</a>create(type, [properties]) -> [Database](https://github.com/jmike/naomi/wiki/Database)

Creates and returns a new [Database](https://github.com/jmike/naomi/wiki/Database) of the designated type.

##### Parameters

Name | Type | Description | Notes
:--- | :--- | :--- | :---
type | string | the database type, i.e. "mysql", "postgres" | required
properties | object | connection properties | optional

###### Available connection properties

Name | Type | Description | Notes
:--- | :--- | :--- | :---
host | string | hostname of the database server | default: `localhost`
port | string | port number of the database server | default: `3306` (mysql), `5432` (postgres)
user | string | user to access the database | default: `root`
password | string | the password of the user |
database | string | the name of the database |
connectionLimit | number | number of unique connections to maintain in the pool | default: `10`

##### Example

```javascript
var db = naomi.create('postgres', {
  host: 'localhost',
  port: 5432,
  user: 'user',
  password: 'password',
  database: 'testdb'
});
```

##### Notes

Naomi automatically reads and assigns the following environmental variables to connection properties, depending on the database type.

 | MySQL | Postgres
:--- | :--- | :---
host | `MYSQL_HOST` | `POSTGRES_HOST`
port | `MYSQL_PORT` | `POSTGRES_PORT`
user | `MYSQL_USER` | `POSTGRES_USER`
password | `MYSQL_PASSWORD` | `POSTGRES_PASSWORD`
database | `MYSQL_DATABASE` | `POSTGRES_DATABASE`
