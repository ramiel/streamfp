const { Transform } = require('stream');

class Flat extends Transform {
  _transform(chunk, encoding, callback) {
    const parts = Array.isArray(chunk) ? chunk : [chunk];
    for (let i = 0, len = parts.length; i < len; i++) {
      this.push(parts[i]);
    }
    callback();
  }
}

/**
 * This function produce a flatter.
 * Given each chunk as array, it push a value for each value of the array.
 * This trasnformer can emit more output values than it receives as input
 */
module.exports = (options = {}) => new Flat({
  readableObjectMode: true,
  writableObjectMode: true,
  ...options,
});
