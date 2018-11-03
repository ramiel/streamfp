const { Transform } = require('stream');

class Reducer extends Transform {
  constructor(options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
      ...options,
    });
    if (!options.reducer || !(options.reducer instanceof Function)) {
      throw new Error('A reducer function is mandatory');
    }
    this.reducer = options.reducer;
    this.acc = options.acc !== undefined
      ? options.acc
      : [];
  }

  _transform(chunk, encoding, callback) {
    try {
      this.acc = this.reducer(this.acc, chunk);
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
module.exports = (reducer, acc) => new Reducer({ reducer, acc });
