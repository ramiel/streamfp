const { Transform } = require('stream');

class Filter extends Transform {
  constructor(options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
      ...options,
    });
    this.index = 0;
    this.filter = options.filter || (x => x);
  }

  _transform(chunk, encoding, callback) {
    let take;
    try {
      take = this.filter(chunk, this.index++);
    } catch (e) {
      return callback(e);
    }
    return callback(null, take ? chunk : undefined);
  }
}

/**
 * This function produce a filter.
 */
module.exports = filter => new Filter({ filter });
