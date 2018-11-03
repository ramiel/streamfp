const { Transform } = require('stream');

class Mapper extends Transform {
  constructor(options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
      ...options,
    });
    this.map = options.map || (x => x);
    this.mapOnFlush = options.mapOnFlush;
  }

  _onData(chunk, encoding, callback) {
    let res;
    try {
      res = this.map(chunk);
    } catch (e) {
      callback(e);
      return;
    }
    callback(null, res);
  }

  _transform(chunk, encoding, callback) {
    this._onData(chunk, encoding, callback);
  }

  _flush(callback) {
    if (this.mapOnFlush) {
      this._onData(null, null, callback);
    } else {
      callback(null);
    }
  }
}

/**
 * This function produce a mapper.
 */
module.exports = (map, { mapOnFlush } = { mapOnFlush: false }) => new Mapper({ map, mapOnFlush });
