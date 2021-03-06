const { Transform } = require('stream');
const { isCallable } = require('./utils');

class Reduce extends Transform {
  constructor(options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
      ...options,
    });
    if (!options.reducer || !isCallable(options.reducer)) {
      throw new Error('A reducer function is mandatory');
    }
    this.reducer = options.reducer;
    this.acc = options.acc;
    this.waitSecondChunk = this.acc === undefined;
  }

  _transform(chunk, encoding, callback) {
    try {
      if (this.waitSecondChunk && chunk !== null) {
        this.acc = chunk;
        this.waitSecondChunk = false;
      } else {
        this.acc = this.reducer(this.acc, chunk);
      }
    } catch (e) {
      return callback(e);
    }
    return callback();
  }

  _flush(callback) {
    callback(null, this.acc);
  }
}

/**
 * This function produce a reducer.
 * Given a stream, this function will reduce each data getting into the stream.
 * When the stream ends the reduced value is returned.
 * @param {Function} reducer Is the reduce function. This mjust return the accumulated value
 * @param {Any} acc An optional accumulator. An empty array by default
 */
module.exports = (reducer, acc) => new Reduce({ reducer, acc });
