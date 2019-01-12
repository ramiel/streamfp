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
    this.title = typeof options.inspectFn === 'string' ? options.inspectFn : undefined;
  }

  _transform(chunk, encoding, callback) {
    const params = [chunk];
    if (this.title !== undefined) {
      params.push(this.title);
    }
    this.inspectFn.apply(null, params);
    callback(null, chunk);
  }
}

/**
 * This PassThrough transformer logs everything pass through it
 */
module.exports = inspectFn => new Inspector({ inspectFn });
