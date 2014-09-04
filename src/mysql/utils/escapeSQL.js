/**
 * Escapes the given string to use safely in a SQL query.
 * @param {string} str
 * @returns {string}
 * @static
 */
module.exports = function (str) {
  return '`' + str + '`';
};
