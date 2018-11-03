const { Transform } = require('stream');

class Inspector extends Transform {
  constructor(options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
      ...options,
    });
    this.inspectFn = options.inspectFn !== undefined && typeof options.inspectFn !== 'string'
      ? options.inspectFn
      : console.log; // eslint-disable-line no-console
    this.title = typeof options.inspectFn === 'string' ? options.inspectFn : '';
  }

  _transform(chunk, encoding, callback) {
    this.inspectFn(chunk, this.title);
    callback(null, chunk);
  }
}

/**
 * This PassThrough transformer logs everything pass through it
 */
module.exports = inspectFn => new Inspector({ inspectFn });
