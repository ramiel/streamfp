const map = require('./map');

/**
 * This function executes a function for each chunk that pass though it
 */
module.exports = fn => map((chunk) => {
  fn(chunk);
  return chunk;
});
