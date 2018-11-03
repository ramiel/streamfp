const { Transform } = require('stream');

class Group extends Transform {
  constructor(options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
      ...options,
    });
    this.size = options.size || 1;
    this.set = [];
  }

  _transform(chunk, encoding, callback) {
    const { set, size } = this;
    set.push(chunk);
    if (set.length >= size) {
      const result = set.slice(0);
      this.set = [];
      return callback(null, result);
    }
    return callback();
  }

  _flush(callback) {
    if (this.set.length > 0) {
      const result = this.set.slice(0);
      this.set = [];
      return callback(null, result);
    }
    return callback(null);
  }
}

/**
 * This transformer groups responses producing array of a defined size.
 * The output is always an array
 */
module.exports = size => new Group({ size });
