import _ from 'lodash';

class Limit {

  /**
   * Parses the supplied limit and returns an abstract syntax tree (ast).
   * @param {number} [limit] a positive integer.
   * @return {Array}
   * @static
   */
  static parse(limit: ?number): Array {
    // check if limit is null or undefined
    if (_.isNil(limit)) {
      return ['LIMIT', null];
    }

    // make sure limit is a positive integer
    if (limit % 1 !== 0 || limit < 1) {
      throw new TypeError(`Invalid limit argument; expected positive integer (i.e. greater than 0)`);
    }

    return ['LIMIT', limit];
  }

}

export default Limit;
