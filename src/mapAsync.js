const { Transform } = require('stream');

class MapAsync extends Transform {
  constructor(options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
      ...options,
    });
    this.map = options.map || (async x => x);
  }

  _transform(chunk, encoding, callback) {
    let promise;
    try {
      promise = this.map(chunk);
    } catch (e) {
      callback(e);
      return;
    }
    if (!(promise instanceof Promise)) {
      promise = Promise.resolve(promise);
    }
    promise
      .then((res) => { callback(null, res); })
      .catch(callback);
  }
}

/**
 * This function produce an async mapper.
 * Each chunk pass through the asynchronous mapper function (Identity by default)
 * and the result is written in the output stream
 */
module.exports = map => new MapAsync({ map });
