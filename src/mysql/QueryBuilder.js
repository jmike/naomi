var _ = require('lodash'),
  operators = require('./operators.json');

/**
 * Escapes the given column name to be used in a SQL query.
 * @param {String} column the name of the column.
 * @returns {String}
 * @private
 */
function escapeSQL(column) {
  return '`' + column + '`';
}

/**
 * Compiles and returns a parameterized SQL expression, based on the given expression input.
 * @param {Object} expr an object with a single property, where key represents the operator.
 * @returns {Object} with two properties: "sql" and "params".
 * @private
 */
function compileExpression(expr) {
  var sql = '',
    params = [],
    k, v;

  k = Object.keys(expr)[0];
  v = expr[k];

  k = operators[k]; // convert to sql equivalent

  if (v === null && k === '=') {
    sql = 'IS NULL';

  } else if (v === null && k === '!=') {
    sql = 'IS NOT NULL';

  } else {
    sql = k + ' ?';
    params = [v];
  }

  return {sql: sql, params: params};
}

/**
 * Compiles and returns a parameterized SQL where clause, based on the given selector input.
 * @param {Object|Array.<Object>} selector
 * @returns {Object} with two properties: "sql" and "params".
 * @private
 */
function compileWhereClause (selector) {
  var sql = [], params = [];

  if (_.isPlainObject(selector)) { // standard selector type
    _.forOwn(selector, function (v, k) {
      var expr;

      k = escapeSQL(k);

      if (v === null) { // null value
        sql.push(k + ' IS NULL');

      } else if (_.isPlainObject(v)) { // expression specified
        expr = compileExpression(v);
        sql.push(k + ' ' + expr.sql);
        params.push.apply(params, expr.params);

      } else { // plain value
        sql.push(k + ' = ?');
        params.push(v);
      }
    }, this);

    return {sql: sql.join(' AND '), params: params};

  } else if (_.isArray(selector)) { // array of selectors
    selector.forEach(function (selector) {
      var result = compileWhereClause(selector);

      sql.push(result.sql);
      params.push.apply(params, result.params);
    }, this);

    return {sql: sql.join(' OR '), params: params};
  }
}

/**
 * Compiles and returns a SQL order clause, based on the given order input.
 * @param {Object|Array<Object>} order
 * @returns {String}
 * @private
 */
function compileOrderClause (order) {
  var sql = [],
    keys, k, v;

  if (_.isPlainObject(order)) {
    keys = Object.keys(order);

    k = escapeSQL(keys[0]);
    v = order[k].toUpperCase();

    sql.push(k + ' ' + v);

  } else if (_.isArray(order)) {
    order.forEach(function (e) {
      sql.push(compileOrderClause(e));
    }, this);
  }

  return sql.join(', ');
}

/**
 * Constructs a new MySQL QueryBuilder for the designated table.
 * @param {Table} table
 * @constructor
 */
function QueryBuilder(table) {
  this.table = table;
}

QueryBuilder.prototype.select = function () {
  return new QueryBuilder.Select(this.table);
};

QueryBuilder.prototype.count = function () {
  return new QueryBuilder.Count(this.table);
};

QueryBuilder.prototype.del = function () {
  return new QueryBuilder.Delete(this.table);
};

QueryBuilder.prototype.upsert = function () {
  return new QueryBuilder.Upsert(this.table);
};

/**
 * Constructs a new SELECT QueryBuilder for the designated table.
 * @param {Table} table
 * @constructor
 */
QueryBuilder.Select = function (table) {
  this.table = table;
  this.selector = null;
  this.order = null;
  this.limit = null;
  this.offset = null;
};

/**
 * Sets the query selector and returns this to enable method chaining.
 * @param {Object|Array.<Object>} selector
 * @return {this}
 */
QueryBuilder.Select.prototype.where = function (selector) {
  this.selector = selector;
  return this;
};

/**
 * Sets the query order and returns this to enable method chaining.
 * @param {Object|Array.<Object>} order
 * @return {this}
 */
QueryBuilder.Select.prototype.orderBy = function (order) {
  this.order = order;
  return this;
};

/**
 * Sets the query limit and returns this to enable method chaining.
 * @param {Number} limit
 * @return {this}
 */
QueryBuilder.Select.prototype.limit = function (limit) {
  this.limit = limit;
  return this;
};

/**
 * Sets the query offset and returns this to enable method chaining.
 * @param {Number} offset
 * @return {this}
 */
QueryBuilder.Select.prototype.offset = function (offset) {
  this.offset = offset;
  return this;
};

/**
 * Compiles and returns a parameterizes SELECT SQL statement.
 * @return {Object} e.g. {sql: '', params: []}
 */
QueryBuilder.Select.prototype.compile = function () {
  var sql, params, clause;

  sql = 'SELECT * FROM `' + this.table.name + '`';
  params = [];

  if (this.selector) {
    clause = compileWhereClause(this.selector);
    sql += ' WHERE ' + clause.sql;
    params.push.apply(params, clause.params);
  }

  if (this.order) {
    clause = compileOrderClause(this.order);
    sql += ' ORDER BY ' + clause;
  }

  if (this.limit) sql += ' LIMIT ' + this.limit;
  if (this.offset) sql += ' OFFSET ' + this.offset;

  sql += ';';

  return {sql: sql, params: params};
};

/**
 * Constructs a new COUNT QueryBuilder for the designated table.
 * @param {Table} table
 * @constructor
 */
QueryBuilder.Count = function (table) {
  this.table = table;
  this.selector = null;
  this.order = null;
  this.limit = null;
  this.offset = null;
};

/**
 * Sets the query selector and returns this to enable method chaining.
 * @param {Object|Array.<Object>} selector
 * @return {this}
 */
QueryBuilder.Count.prototype.where = function (selector) {
  this.selector = selector;
  return this;
};

/**
 * Sets the query order and returns this to enable method chaining.
 * @param {Object|Array.<Object>} order
 * @return {this}
 */
QueryBuilder.Count.prototype.orderBy = function (order) {
  this.order = order;
  return this;
};

/**
 * Sets the query limit and returns this to enable method chaining.
 * @param {Number} limit
 * @return {this}
 */
QueryBuilder.Count.prototype.limit = function (limit) {
  this.limit = limit;
  return this;
};

/**
 * Sets the query offset and returns this to enable method chaining.
 * @param {Number} offset
 * @return {this}
 */
QueryBuilder.Count.prototype.offset = function (offset) {
  this.offset = offset;
  return this;
};

/**
 * Compiles and returns a parameterizes SELECT SQL statement.
 * @return {Object} e.g. {sql: '', params: []}
 */
QueryBuilder.Count.prototype.compile = function () {
  var sql, params, clause;

  sql = 'SELECT COUNT(*) AS `count` FROM `' + this.table.name + '`';
  params = [];

  if (this.selector) {
    clause = compileWhereClause(this.selector);
    sql += ' WHERE ' + clause.sql;
    params.push.apply(params, clause.params);
  }

  if (this.order) {
    clause = compileOrderClause(this.order);
    sql += ' ORDER BY ' + clause;
  }

  if (this.limit) sql += ' LIMIT ' + this.limit;
  if (this.offset) sql += ' OFFSET ' + this.offset;

  sql += ';';

  return {sql: sql, params: params};
};

/**
 * Constructs a new DELETE QueryBuilder for the designated table.
 * @param {Table} table
 * @constructor
 */
QueryBuilder.Delete = function (table) {
  this.table = table;
  this.selector = null;
  this.order = null;
  this.limit = null;
  this.offset = null;
};

/**
 * Sets the query selector and returns this to enable method chaining.
 * @param {Object|Array.<Object>} selector
 * @return {this}
 */
QueryBuilder.Delete.prototype.where = function (selector) {
  this.selector = selector;
  return this;
};

/**
 * Sets the query order and returns this to enable method chaining.
 * @param {Object|Array.<Object>} order
 * @return {this}
 */
QueryBuilder.Delete.prototype.orderBy = function (order) {
  this.order = order;
  return this;
};

/**
 * Sets the query limit and returns this to enable method chaining.
 * @param {Number} limit
 * @return {this}
 */
QueryBuilder.Delete.prototype.limit = function (limit) {
  this.limit = limit;
  return this;
};

/**
 * Compiles and returns a parameterizes SELECT SQL statement.
 * @return {Object} e.g. {sql: '', params: []}
 */
QueryBuilder.Delete.prototype.compile = function () {
  var sql, params, clause;

  sql = 'DELETE FROM `' + this.table.name + '`';
  params = [];

  if (this.selector) {
    clause = compileWhereClause(this.selector);
    sql += ' WHERE ' + clause.sql;
    params.push.apply(params, clause.params);
  }

  if (this.order) {
    clause = compileOrderClause(this.order);
    sql += ' ORDER BY ' + clause;
  }

  if (this.limit) sql += ' LIMIT ' + this.limit;

  sql += ';';

  return {sql: sql, params: params};
};

/**
 * Constructs a new UPSERT QueryBuilder for the designated table.
 * @param {Table} table
 * @constructor
 */
QueryBuilder.Upsert = function (table) {
  this.table = table;
  this.values = null;
};

/**
 * Sets the query values and returns this to enable method chaining.
 * @param {Object|Array.<Object>} values
 * @return {this}
 */
QueryBuilder.Upsert.prototype.values = function (values) {
  this.values = values;
  return this;
};

/**
 * Compiles and returns a parameterizes SELECT SQL statement.
 * @return {Object} e.g. {sql: '', params: []}
 */
QueryBuilder.Upsert.prototype.compile = function () {
  var sql, params, keys;

  sql = 'INSERT INTO `' + this.table.name + '`';
  params = [];

  // extract column names
  keys = Object.keys(this.values[0]); // assumes all objects in attrs have the same properties

  // append column names to SQL
  sql += ' (' + keys.map(function (k) {
    return escapeSQL(k);
  }, this).join(', ') + ')';

  // append values to SQL
  sql += ' VALUES ' +
    this.values.map(function(obj) {
      return '(' + keys.map(function (k) {
        params.push(obj[k]);
        return '?';
      }).join(', ') + ')';
    }).join(', ');

  // append on duplicate key clause to SQL
  sql += ' ON DUPLICATE KEY UPDATE ' +
    _.difference(keys, this.collection.primaryKey)
    .map(function (k) {
      k = escapeSQL(k);
      return k + ' = VALUES(' + k + ')';
    }, this).join(', ');

  sql += ';';

  return {sql: sql, params: params};
};

// /**
//  * Compiles and returns a SQL upsert statement.
//  * @param {Array<Object>|Object} attrs the record attributes to create/update in the collection.
//  * @param {Object} [options]
//  * @returns {Object}
//  * @throws {Error} if parameters are invalid
//  */
// QueryBuilder.prototype.compileUpsertSQL = function (attrs, options) {
//   var sql, params, keys;

//   // validate "attrs" param
//   if (_.isPlainObject(attrs)) {
//     attrs = [attrs]; // convert to array

//   } else if (!_.isArray(attrs)) {
//     throw new Error('Invalid attributes param - expected Object or Array<Object>, got ' + typeof(attrs));

//   } else if (attrs.length === 0) {
//     throw new Error('Attributes array cannot be empty');
//   }

//   // handle optional "options" param
//   if (options === undefined) {
//     options = {};
//   }

//   // init parameterized SQL query
//   sql = 'INSERT INTO `' + this.collection.table + '`';
//   params = [];

//   // extract column names
//   keys = Object.keys(attrs[0]); // assuming all objects in attrs have the same property

//   // check if column names exist in collection
//   keys.forEach(function (k) {
//     if (!this.collection.hasColumn(k)) {
//       throw new Error('Column "' + k + '" cannot not be found in table "' + this.collection.table + '"');
//     }
//   }, this);

//   // append column names to SQL
//   sql += ' (' +
//     keys.map(function (k) {
//       return escapeSQL(k);
//     }, this).join(', ') +
//     ')';

//   // append values to SQL
//   sql += ' VALUES ' +
//     attrs.map(function(obj) {
//       return '(' +
//         keys.map(function (k) {
//           params.push(obj[k]);
//           return '?';
//         }).join(', ') +
//       ')';
//     }).join(', ');

//   // append the on duplicate key clause ...
//   sql += ' ON DUPLICATE KEY UPDATE ' +
//     _.difference(keys, this.collection.primaryKey)
//     .map(function (k) {
//       k = escapeSQL(k);
//       return k + ' = VALUES(' + k + ')';
//     }, this).join(', ');

//   sql += ';';

//   return {sql: sql, params: params};
// };

module.exports = QueryBuilder;
