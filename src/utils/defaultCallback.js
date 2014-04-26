/**
 * A default callback function that throws an error when necessary.
 * @param {Error} error.
 * @private
 */
function defaultCallback(error) {
  if (error) throw error;
}

module.exports = defaultCallback;
