```
var db = rdb.create('MYSQL', {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'rdb_test',
});

db.connect();

db.query('SELECT * FROM test;', function (error, data) {
  if (error) {
    console.error(error);
    return;
  }

  // do something with data
  console.log(JSON.stringify(data, null, 4));
});
```
