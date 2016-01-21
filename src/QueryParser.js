import _ from 'lodash';
// import type from 'type-of';
// import CustomError from 'customerror';

import $selection from './querylang/selection';
import $projection from './querylang/projection';
import $orderby from './querylang/orderby';
import $limit from './querylang/limit';
import $offset from './querylang/offset';

class QueryParser {

  constructor() {
    this.comparisonOperators = new Map();
    this.logicalOperators = new Map();
  }

  /**
   * Parses the supplied query expression and returns an abstract syntax tree (ast).
   * @param {Number, String, Date, Buffer, Boolean, Array, Object} [$expr] optional expression.
   * @return {Object}
   * @throws {QueryParseError} if the supplied expression is invalid.
   */
  parse(query: ?number | string | boolean | Object | Array): Object {
    // check if query is null or undefined
    if (_.isNull(query) || _.isUndefined(query)) {
      query = {};
    }

    // check if query is number, string, boolean, date or buffer
    if (_.isNumber(query) || _.isString(query) || _.isDate(query) || Buffer.isBuffer(query) || _.isBoolean(query)) {
      query = {'$id': {'$eq': query}};
    }

    // check if query is array
    if (_.isArray(query)) {
      query = {'$id': {'$in': query}};
    }

    return {
      selection: $selection.parse(_.omit(query, ['$projection', '$orderby', '$limit', '$offset'])),
      projection: $projection.parse(query.$projection),
      orderby: $orderby.parse(query.$orderby),
      limit: $limit.parse(query.$limit),
      offset: $offset.parse(query.$offset),
    };
  }
}

// create parser instance
const parser = new QueryParser();

export default parser; // singleton
