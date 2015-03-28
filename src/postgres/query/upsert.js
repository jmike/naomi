var _ = require('lodash');
var type = require('type-of');
var escape = require('./escape');

// WITH
//   updated AS (
//     UPDATE {{escape table}}
//     SET {{assignments}}
//     WHERE {{where}}
//     RETURNING {{returning}}
//   ),
//   inserted AS (
//     INSERT INTO {{escape table}} ({{columns}})
//     SELECT {{values}}
//     WHERE NOT EXISTS (SELECT * FROM updated)
//     RETURNING {{returning}}
//   )
// SELECT * FROM inserted
// UNION ALL
// SELECT * FROM updated

module.exports = function (query, table) {
  var sql = [];
  var params = [];
  var expr;

  // handle optional query argument
  if (_.isUndefined(query)) query = {};

  // make sure query argument is valid
  if (!_.isPlainObject(query)) {
    throw new Error('Invalid query parameter; expected object, received ' + type(query));
  }

  // unpack query properties
  var $values = query.$values;
  var $columns = query.$columns || Object.keys($values);
  var $updateColumns = query.$updateColumns || _.difference($columns, table.primaryKey);
  var $key = table.extractKey($values);

  // build query
  sql.push('WITH');

  sql.push('updated AS (');

  sql.push('UPDATE', escape(table.name));

  expr = _.chain($updateColumns)
    .map(function (k) {
      params.push($values[k]);
      return escape(k) + ' = ?';
    })
    .value()
    .join(', ');

  sql.push('SET', expr);

  expr = _.chain($key)
    .map(function (k) {
      params.push($values[k]);
      return escape(k) + ' = ?';
    })
    .value()
    .join(' AND ');

  sql.push('WHERE', expr);

  sql.push('RETURNING *');

  sql.push('),');

  sql.push('inserted AS (');

  sql.push('INSERT INTO', escape(table.name));

  expr = _.chain($columns)
    .map(function (k) {
      return escape(k);
    })
    .value()
    .join(', ');

  if (expr !== '') sql.push('(' + expr + ')');

  expr = _.chain($columns)
    .map(function (k) {
      params.push($values[k]);
      return '?';
    })
    .value()
    .join(', ');

  sql.push('SELECT', expr);

  sql.push('WHERE NOT EXISTS (SELECT * FROM updated)');

  sql.push('RETURNING *');

  sql.push(')');

  sql.push('SELECT * FROM inserted');
  sql.push('UNION ALL');
  sql.push('SELECT * FROM updated');

  return {sql: sql.join(' ') + ';', params: params};
};
