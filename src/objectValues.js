const { Transform } = require('stream');

class ObjectValues extends Transform {
  _transform(chunk, encoding, callback) {
    let parts;
    try {
      parts = Object.values(chunk);
    } catch (e) {
      callback(e);
      return;
    }
    for (let i = 0, len = parts.length; i < len; i++) {
      this.push(parts[i]);
    }
    callback();
  }
}

/**
 * This function produce a object values flattener.
 * Given a chunk which is an object, it push a value for each value of the object
 * e.g given a chunnk {a: {value: 1}, b: {value: 2}}
 * it emits
 * {value: 1} and {value: 2} as two different chunks
 */
module.exports = (options = {}) => new ObjectValues({
  readableObjectMode: true,
  writableObjectMode: true,
  ...options,
});
