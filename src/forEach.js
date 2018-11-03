const mapper = require('./mapper');

/**
 * This function executes a function for each chunk that pass though it
 */
module.exports = fn => mapper((chunk) => {
  fn(chunk);
  return chunk;
});
