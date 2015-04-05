# Naomi

A detailed description of the naomi API.

## Table of Contents

* [Quick start](#quick-start)
* [Methods](#methods)
  * [create(engine, [props])](#create)

## Quick start

Reference naomi by requiring the homonymous module.

```javascript
var naomi = require('naomi');
```

## Methods

### <a name="create" href="#create">#</a>create(engine, [props]) -> [Database](https://github.com/jmike/naomi/blob/master/docs/database.md)

Creates and returns a new Database of the designated engine type and properties.

##### Parameters

* `engine` _(String)_ the database engine, i.e. "mysql" or "postgres"
* `props` _(Object)_ connection properties
  * `host` _(String)_ optional hostname; defaults to "localhost"
  * `port` _(Number)_ optional port number; defaults to 3306 for MySQL, 5432 for Postgres
  * `user` _(String)_ optional user name to access the database; defaults to "root"
  * `password` _(String)_ optional password to access the database; defaults to "" (i.e. empty string)
  * `connectionLimit` _(Number)_ optional maximum number of connections to maintain in the pool; defaults to 10
  * `ssl` _(String)_ optional ssl options; set to "Amazon RDS" to connect to an Amazon RDS server securely

##### Returns

A new [Database](https://github.com/jmike/naomi/blob/master/docs/database.md) instance.

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
